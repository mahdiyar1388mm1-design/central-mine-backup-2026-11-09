import { PermissionViews } from './permission-view.type';

/** دسترسی‌های ممکن در زیرسیستم مسکن سرزمین */

export enum PermissionTag {
  //SECTION User
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  FIND_USER = 'FIND_USER',
  SUSPEND_USER = 'SUSPEND_USER',
  ACTIVATE_USER = 'ACTIVATE_USER',
  //!SECTION User

  //SECTION Role
  CREATE_ROLE = 'CREATE_ROLE',
  READ_ROLE = 'READ_ROLE',
  FIND_ROLE = 'FIND_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  //!SECTION Role

  //SECTION User Role
  CREATE_USER_ROLE = 'CREATE_USER_ROLE',
  READ_USER_ROLE = 'READ_USER_ROLE',
  FIND_USER_ROLE = 'FIND_USER_ROLE',
  UPDATE_USER_ROLE = 'UPDATE_USER_ROLE',
  DELETE_USER_ROLE = 'DELETE_USER_ROLE',
  //!SECTION User Role

  //SECTION Property
  CREATE_PROPERTY = 'CREATE_PROPERTY',
  UPDATE_PROPERTY = 'UPDATE_PROPERTY',
  FIND_PROPERTY = 'FIND_PROPERTY',
  DELETE_PROPERTY = 'DELETE_PROPERTY',
  //!SECTION Property

  //SECTION Property Attribute
  CREATE_PROPERTY_ATTRIBUTE = 'CREATE_PROPERTY_ATTRIBUTE',
  UPDATE_PROPERTY_ATTRIBUTE = 'UPDATE_PROPERTY_ATTRIBUTE',
  FIND_PROPERTY_ATTRIBUTE = 'FIND_PROPERTY_ATTRIBUTE',
  DELETE_PROPERTY_ATTRIBUTE = 'DELETE_PROPERTY_ATTRIBUTE',
  //!SECTION Property Attribute

  //SECTION Property Description
  CREATE_PROPERTY_DESCRIPTION = 'CREATE_PROPERTY_DESCRIPTION',
  UPDATE_PROPERTY_DESCRIPTION = 'UPDATE_PROPERTY_DESCRIPTION',
  FIND_PROPERTY_DESCRIPTION = 'FIND_PROPERTY_DESCRIPTION',
  DELETE_PROPERTY_DESCRIPTION = 'DELETE_PROPERTY_DESCRIPTION',
  //!SECTION Property Description

  //SECTION Property Image
  CREATE_PROPERTY_IMAGE = 'CREATE_PROPERTY_IMAGE',
  UPDATE_PROPERTY_IMAGE = 'UPDATE_PROPERTY_IMAGE',
  FIND_PROPERTY_IMAGE = 'FIND_PROPERTY_IMAGE',
  DELETE_PROPERTY_IMAGE = 'DELETE_PROPERTY_IMAGE',
  //!SECTION Property Image

  //SECTION Property Video
  CREATE_PROPERTY_VIDEO = 'CREATE_PROPERTY_VIDEO',
  UPDATE_PROPERTY_VIDEO = 'UPDATE_PROPERTY_VIDEO',
  FIND_PROPERTY_VIDEO = 'FIND_PROPERTY_VIDEO',
  DELETE_PROPERTY_VIDEO = 'DELETE_PROPERTY_VIDEO',
  //!SECTION Property Video

  //SECTION Favorite
  CREATE_FAVORITE = 'CREATE_FAVORITE',
  FIND_FAVORITE = 'FIND_FAVORITE',
  DELETE_FAVORITE = 'DELETE_FAVORITE',
  //!SECTION Favorite

  //SECTION Property Request
  CREATE_PROPERTY_REQUEST = 'CREATE_PROPERTY_REQUEST',
  FIND_PROPERTY_REQUEST = 'FIND_PROPERTY_REQUEST',
  UPDATE_PROPERTY_REQUEST = 'UPDATE_PROPERTY_REQUEST',
  DELETE_PROPERTY_REQUEST = 'DELETE_PROPERTY_REQUEST',
  //!SECTION Property Request

  //SECTION Property Visit
  CREATE_PROPERTY_VISIT = 'CREATE_PROPERTY_VISIT',
  FIND_PROPERTY_VISIT = 'FIND_PROPERTY_VISIT',
  UPDATE_PROPERTY_VISIT = 'UPDATE_PROPERTY_VISIT',
  //!SECTION Property Visit

  //SECTION Notification
  FIND_NOTIFICATION = 'FIND_NOTIFICATION',
  UPDATE_NOTIFICATION = 'UPDATE_NOTIFICATION',
  //!SECTION Notification

  //SECTION Message
  CREATE_MESSAGE_THREAD = 'CREATE_MESSAGE_THREAD',
  FIND_MESSAGE_THREAD = 'FIND_MESSAGE_THREAD',
  CREATE_MESSAGE = 'CREATE_MESSAGE',
  FIND_MESSAGE = 'FIND_MESSAGE',
  //!SECTION Message
}

export const PermissionTagKeys = Object.keys(PermissionTag);
export const PermissionTagValues = PermissionTagKeys.map((k) => {
  return PermissionTag[k as any];
});

export const permissionsView: PermissionViews = {
  [PermissionTag.CREATE_USER]: {
    category: 'USER',
    group: 'User',
    name: 'Create',
  },
  [PermissionTag.UPDATE_USER]: {
    category: 'USER',
    group: 'User',
    name: 'Update',
  },
  [PermissionTag.FIND_USER]: {
    category: 'USER',
    group: 'User',
    name: 'Find',
  },
  [PermissionTag.SUSPEND_USER]: {
    category: 'USER',
    group: 'User',
    name: 'Suspend',
  },
  [PermissionTag.ACTIVATE_USER]: {
    category: 'USER',
    group: 'User',
    name: 'Activate',
  },

  [PermissionTag.CREATE_ROLE]: {
    category: 'USER_ROLE',
    group: 'Role',
    name: 'Create',
  },
  [PermissionTag.READ_ROLE]: {
    category: 'USER_ROLE',
    group: 'Role',
    name: 'Read',
  },
  [PermissionTag.FIND_ROLE]: {
    category: 'USER_ROLE',
    group: 'Role',
    name: 'Find',
  },
  [PermissionTag.UPDATE_ROLE]: {
    category: 'USER_ROLE',
    group: 'Role',
    name: 'Update',
  },
  [PermissionTag.DELETE_ROLE]: {
    category: 'USER_ROLE',
    group: 'Role',
    name: 'Delete',
  },

  [PermissionTag.CREATE_USER_ROLE]: {
    category: 'USER_ROLE',
    group: 'User Role',
    name: 'Assign Role',
  },
  [PermissionTag.READ_USER_ROLE]: {
    category: 'USER_ROLE',
    group: 'User Role',
    name: 'Read',
  },
  [PermissionTag.FIND_USER_ROLE]: {
    category: 'USER_ROLE',
    group: 'User Role',
    name: 'Find',
  },
  [PermissionTag.UPDATE_USER_ROLE]: {
    category: 'USER_ROLE',
    group: 'User Role',
    name: 'Update',
  },
  [PermissionTag.DELETE_USER_ROLE]: {
    category: 'USER_ROLE',
    group: 'User Role',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY]: {
    category: 'PROPERTY',
    group: 'Property',
    name: 'Create',
  },
  [PermissionTag.UPDATE_PROPERTY]: {
    category: 'PROPERTY',
    group: 'Property',
    name: 'Update',
  },
  [PermissionTag.FIND_PROPERTY]: {
    category: 'PROPERTY',
    group: 'Property',
    name: 'Find',
  },
  [PermissionTag.DELETE_PROPERTY]: {
    category: 'PROPERTY',
    group: 'Property',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_ATTRIBUTE]: {
    category: 'PROPERTY',
    group: 'Property Attribute',
    name: 'Create',
  },
  [PermissionTag.UPDATE_PROPERTY_ATTRIBUTE]: {
    category: 'PROPERTY',
    group: 'Property Attribute',
    name: 'Update',
  },
  [PermissionTag.FIND_PROPERTY_ATTRIBUTE]: {
    category: 'PROPERTY',
    group: 'Property Attribute',
    name: 'Find',
  },
  [PermissionTag.DELETE_PROPERTY_ATTRIBUTE]: {
    category: 'PROPERTY',
    group: 'Property Attribute',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_DESCRIPTION]: {
    category: 'PROPERTY',
    group: 'Property Description',
    name: 'Create',
  },
  [PermissionTag.UPDATE_PROPERTY_DESCRIPTION]: {
    category: 'PROPERTY',
    group: 'Property Description',
    name: 'Update',
  },
  [PermissionTag.FIND_PROPERTY_DESCRIPTION]: {
    category: 'PROPERTY',
    group: 'Property Description',
    name: 'Find',
  },
  [PermissionTag.DELETE_PROPERTY_DESCRIPTION]: {
    category: 'PROPERTY',
    group: 'Property Description',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_IMAGE]: {
    category: 'PROPERTY',
    group: 'Property Image',
    name: 'Create',
  },
  [PermissionTag.UPDATE_PROPERTY_IMAGE]: {
    category: 'PROPERTY',
    group: 'Property Image',
    name: 'Update',
  },
  [PermissionTag.FIND_PROPERTY_IMAGE]: {
    category: 'PROPERTY',
    group: 'Property Image',
    name: 'Find',
  },
  [PermissionTag.DELETE_PROPERTY_IMAGE]: {
    category: 'PROPERTY',
    group: 'Property Image',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_VIDEO]: {
    category: 'PROPERTY',
    group: 'Property Video',
    name: 'Create',
  },
  [PermissionTag.UPDATE_PROPERTY_VIDEO]: {
    category: 'PROPERTY',
    group: 'Property Video',
    name: 'Update',
  },
  [PermissionTag.FIND_PROPERTY_VIDEO]: {
    category: 'PROPERTY',
    group: 'Property Video',
    name: 'Find',
  },
  [PermissionTag.DELETE_PROPERTY_VIDEO]: {
    category: 'PROPERTY',
    group: 'Property Video',
    name: 'Delete',
  },

  [PermissionTag.CREATE_FAVORITE]: {
    category: 'CUSTOMER',
    group: 'Favorite',
    name: 'Create',
  },
  [PermissionTag.FIND_FAVORITE]: {
    category: 'CUSTOMER',
    group: 'Favorite',
    name: 'Find',
  },
  [PermissionTag.DELETE_FAVORITE]: {
    category: 'CUSTOMER',
    group: 'Favorite',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_REQUEST]: {
    category: 'CUSTOMER',
    group: 'Property Request',
    name: 'Create',
  },
  [PermissionTag.FIND_PROPERTY_REQUEST]: {
    category: 'CUSTOMER',
    group: 'Property Request',
    name: 'Find',
  },
  [PermissionTag.UPDATE_PROPERTY_REQUEST]: {
    category: 'CUSTOMER',
    group: 'Property Request',
    name: 'Update',
  },
  [PermissionTag.DELETE_PROPERTY_REQUEST]: {
    category: 'CUSTOMER',
    group: 'Property Request',
    name: 'Delete',
  },

  [PermissionTag.CREATE_PROPERTY_VISIT]: {
    category: 'CUSTOMER',
    group: 'Property Visit',
    name: 'Create',
  },
  [PermissionTag.FIND_PROPERTY_VISIT]: {
    category: 'CUSTOMER',
    group: 'Property Visit',
    name: 'Find',
  },
  [PermissionTag.UPDATE_PROPERTY_VISIT]: {
    category: 'CUSTOMER',
    group: 'Property Visit',
    name: 'Update',
  },

  [PermissionTag.FIND_NOTIFICATION]: {
    category: 'CUSTOMER',
    group: 'Notification',
    name: 'Find',
  },
  [PermissionTag.UPDATE_NOTIFICATION]: {
    category: 'CUSTOMER',
    group: 'Notification',
    name: 'Update',
  },

  [PermissionTag.CREATE_MESSAGE_THREAD]: {
    category: 'CUSTOMER',
    group: 'Message',
    name: 'Create Thread',
  },
  [PermissionTag.FIND_MESSAGE_THREAD]: {
    category: 'CUSTOMER',
    group: 'Message',
    name: 'Find Thread',
  },
  [PermissionTag.CREATE_MESSAGE]: {
    category: 'CUSTOMER',
    group: 'Message',
    name: 'Send',
  },
  [PermissionTag.FIND_MESSAGE]: {
    category: 'CUSTOMER',
    group: 'Message',
    name: 'Find',
  },
};

export const permissionsViewKeys = Object.keys(permissionsView);

export const PermissionTags = permissionsViewKeys.map((p) => {
  return permissionsView[p as any];
});
