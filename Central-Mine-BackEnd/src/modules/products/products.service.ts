import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { Sku } from './entities/sku.entity';
import { Variation } from './entities/variation.entity';
import { Image } from './entities/image.entity';
import { Video } from './entities/video.entity';
import { Description } from './entities/description.entity';
import { Attribute } from './entities/attribute.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { ProductFindDto } from './dto/product-find.dto';
import { ProductRo } from './dto/product.ro';
import { ProductsRo } from './dto/products.ro';
import { SkuRo } from './dto/sku.ro';
import { IDDto } from 'src/commons/dto/uuid.dto';

/** روابطی که برای برگرداندن یک محصول کامل (با همه‌ی زیرمجموعه‌ها) لازم است */
const PRODUCT_RELATIONS: FindOptionsRelations<Product> = {
  skus: { variations: true, images: true },
  videos: true,
  descriptions: true,
  attributes: true,
};

/** سرویس مدیریت کاتالوگ محصولات فروشگاه (محصول + SKU/تصویر/ویژگی/توضیحات/فیلم) */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(Sku)
    private readonly skusRepo: Repository<Sku>,
    @InjectRepository(Variation)
    private readonly variationsRepo: Repository<Variation>,
    @InjectRepository(Image)
    private readonly imagesRepo: Repository<Image>,
    @InjectRepository(Video)
    private readonly videosRepo: Repository<Video>,
    @InjectRepository(Description)
    private readonly descriptionsRepo: Repository<Description>,
    @InjectRepository(Attribute)
    private readonly attributesRepo: Repository<Attribute>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductRo> {
    const { skus, videos, descriptions, attributes, ...productData } = dto;

    const product = this.repo.create({
      ...productData,
      skus: skus.map((skuDto) => this.buildSku(skuDto)),
      videos: (videos ?? []).map((v) => this.videosRepo.create(v)),
      descriptions: (descriptions ?? []).map((d) =>
        this.descriptionsRepo.create(d),
      ),
      attributes: (attributes ?? []).map((a) => this.attributesRepo.create(a)),
    });

    const saved = await this.repo.save(product);
    return this.getById({ id: saved.id });
  }

  /** ویرایش محصول؛ فرستادن آرایه‌ی یکی از زیرمجموعه‌ها دیگر کل آن مجموعه را
   * پاک/بازسازی نمی‌کند: هر آیتم دارای id همان رکورد موجود را ویرایش می‌کند،
   * بدون id آیتم تازه می‌سازد، و آیتم موجودی که در آرایه‌ی ورودی نباشد حذف
   * می‌شود. مثلاً برای عوض کردن فقط عکس‌های یک SKU کافی است همان یک SKU (با
   * id-اش) را با آرایه‌ی عکس‌های جدید بفرستی.
   *
   * تمام حذف/ویرایش/ساخت داخل یک transaction انجام می‌شود، چون حذف رکوردهای
   * قدیمی و ذخیره‌ی نهایی دو مرحله‌ی جدا هستند: اگر داخل یک transaction نباشند
   * و ذخیره‌ی نهایی (مثلاً به‌خاطر ناقص بودن داده‌ی یک SKU تازه) شکست بخورد،
   * حذفِ از قبل commit‌شده برنمی‌گردد و داده گم می‌شود. */
  async update(id: string, dto: UpdateProductDto): Promise<ProductRo> {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Product);
      const skusRepo = manager.getRepository(Sku);
      const variationsRepo = manager.getRepository(Variation);
      const imagesRepo = manager.getRepository(Image);
      const videosRepo = manager.getRepository(Video);
      const descriptionsRepo = manager.getRepository(Description);
      const attributesRepo = manager.getRepository(Attribute);

      const product = await repo.findOne({
        where: { id },
        relations: PRODUCT_RELATIONS,
      });
      if (!product) throw new NotFoundException(`Product ${id} not found`);

      const { skus, videos, descriptions, attributes, ...productData } = dto;
      Object.assign(product, productData);

      if (skus)
        product.skus = await this.mergeSkus(
          skusRepo,
          variationsRepo,
          imagesRepo,
          product.skus ?? [],
          skus,
        );
      if (videos)
        product.videos = await this.mergeChildren(
          videosRepo,
          product.videos ?? [],
          videos,
        );
      if (descriptions)
        product.descriptions = await this.mergeChildren(
          descriptionsRepo,
          product.descriptions ?? [],
          descriptions,
        );
      if (attributes)
        product.attributes = await this.mergeChildren(
          attributesRepo,
          product.attributes ?? [],
          attributes,
        );

      // ذخیره‌ی product با روابط cascade:true (skus، videos، descriptions،
      // attributes و به‌همین‌ترتیب images/variations زیر هر SKU) همه‌ی
      // رکوردهای تازه/ویرایش‌شده را در همین یک save ماندگار می‌کند؛ چون همه‌ی
      // repo-های بالا از همین manager می‌آیند، هر خطایی کل transaction (حذف‌ها
      // را هم) rollback می‌کند.
      await repo.save(product);
    });

    return this.getById({ id });
  }

  /** یک SKU که id-اش با یکی از SKUهای موجود یکی باشد را ویرایش، بدون id تازه
   * می‌سازد، و SKUهای موجودی که در ورودی نباشند را حذف می‌کند؛ images و
   * variations هر SKU هم به همین ترتیب merge می‌شوند نه پاک/بازسازی. */
  private async mergeSkus(
    skusRepo: Repository<Sku>,
    variationsRepo: Repository<Variation>,
    imagesRepo: Repository<Image>,
    existing: Sku[],
    incoming: UpdateSkuDto[],
  ): Promise<Sku[]> {
    const existingById = new Map(existing.map((s) => [s.id, s]));
    const keepIds = new Set<string>();

    const merged = await Promise.all(
      incoming.map(async ({ id: skuId, variations, images, ...data }) => {
        const existingSku = skuId ? existingById.get(skuId) : undefined;
        if (skuId && !existingSku)
          throw new BadRequestException(
            `SKU ${skuId} not found on this product`,
          );
        if (
          !existingSku &&
          (!data.code ||
            !data.name ||
            data.price === undefined ||
            data.purchasePrice === undefined)
        )
          throw new BadRequestException(
            'A SKU with no id is treated as a new SKU and needs code, name, price and purchasePrice — did you forget to include the id of the existing SKU you meant to edit?',
          );
        const sku = existingSku
          ? Object.assign(existingSku, data)
          : skusRepo.create(data);
        if (existingSku) keepIds.add(existingSku.id);

        if (variations)
          sku.variations = await this.mergeChildren(
            variationsRepo,
            existingSku?.variations ?? [],
            variations,
          );
        if (images)
          sku.images = await this.mergeChildren(
            imagesRepo,
            existingSku?.images ?? [],
            images,
          );

        return sku;
      }),
    );

    const toRemove = existing.filter((s) => !keepIds.has(s.id));
    if (toRemove.length) await skusRepo.remove(toRemove);
    return merged;
  }

  /** merge عمومی برای یک رابطه‌ی یک‌به‌چند تخت: آیتم دارای id همان رکورد را
   * ویرایش، بدون id رکورد تازه می‌سازد (بدون ذخیره؛ ذخیره‌ی نهایی با cascade
   * روی موجودیت والد انجام می‌شود)، و رکورد موجودی که در ورودی نباشد را حذف
   * می‌کند. */
  private async mergeChildren<
    Entity extends { id: string },
    Dto extends { id?: string },
  >(repo: Repository<Entity>, existing: Entity[], incoming: Dto[]) {
    const existingById = new Map(existing.map((e) => [e.id, e]));
    const keepIds = new Set<string>();

    const merged = incoming.map(({ id: itemId, ...data }) => {
      const match = itemId ? existingById.get(itemId) : undefined;
      if (match) {
        keepIds.add(match.id);
        return Object.assign(match, data);
      }
      return repo.create(data as unknown as DeepPartial<Entity>);
    });

    const toRemove = existing.filter((e) => !keepIds.has(e.id));
    if (toRemove.length) await repo.remove(toRemove);
    return merged;
  }

  async find(dto: ProductFindDto): Promise<ProductsRo> {
    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.skus', 'skus')
      .leftJoinAndSelect('skus.variations', 'variations')
      .leftJoinAndSelect('skus.images', 'images')
      .leftJoinAndSelect('product.videos', 'videos')
      .leftJoinAndSelect('product.descriptions', 'descriptions')
      .leftJoinAndSelect('product.attributes', 'attributes')
      .where('product.isDeleted = false');

    if (dto.name)
      qb.andWhere('product.name ILIKE :name', { name: `%${dto.name}%` });
    if (dto.shopID)
      qb.andWhere('product.shopID = :shopID', { shopID: dto.shopID });
    if (dto.categoryId)
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    if (dto.visible !== undefined)
      qb.andWhere('product.visible = :visible', { visible: dto.visible });

    const page = dto.page ?? 1;
    const size = dto.size ?? 20;
    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [products, count] = await qb.getManyAndCount();
    return { products: products.map((p) => this.toRo(p)), count };
  }

  async getById(idDto: IDDto): Promise<ProductRo> {
    const product = await this.findActiveOrThrow(idDto.id);
    return this.toRo(product);
  }

  /** دریافت محصول و افزایش شمارنده‌ی بازدید */
  async view(idDto: IDDto): Promise<ProductRo> {
    const product = await this.findActiveOrThrow(idDto.id);
    product.seen += 1;
    await this.repo.save(product);
    return this.toRo(product);
  }

  /** حذف نرم؛ محصول از جست‌وجو/دریافت خارج می‌شود ولی رکورد باقی می‌ماند */
  async remove(id: string): Promise<void> {
    const result = await this.repo.update({ id }, { isDeleted: true });
    if (result.affected === 0)
      throw new NotFoundException(`Product ${id} not found`);
  }

  private async findActiveOrThrow(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: PRODUCT_RELATIONS,
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  private buildSku(dto: CreateSkuDto, product?: Product): Sku {
    return this.skusRepo.create({
      ...dto,
      product,
      variations: (dto.variations ?? []).map((v) =>
        this.variationsRepo.create(v),
      ),
      images: (dto.images ?? []).map((i) => this.imagesRepo.create(i)),
    });
  }

  private toRo(product: Product): ProductRo {
    return {
      id: product.id,
      name: product.name,
      shopID: product.shopID,
      ownerID: product.ownerID,
      categoryId: product.categoryId,
      sellerDescription: product.sellerDescription,
      length: product.length,
      width: product.width,
      height: product.height,
      visible: product.visible,
      rating: product.rating,
      seen: product.seen,
      skus: (product.skus ?? []).map((sku) => this.toSkuRo(sku)),
      videos: product.videos ?? [],
      descriptions: product.descriptions ?? [],
      attributes: product.attributes ?? [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toSkuRo(sku: Sku): SkuRo {
    return {
      id: sku.id,
      upc: sku.upc,
      code: sku.code,
      name: sku.name,
      price: sku.price,
      purchasePrice: sku.purchasePrice,
      basicPrice: sku.basicPrice,
      stock: sku.stock,
      amountCommission: sku.amountCommission,
      variations: sku.variations ?? [],
      images: sku.images ?? [],
      createdAt: sku.createdAt,
      updatedAt: sku.updatedAt,
    };
  }
}
