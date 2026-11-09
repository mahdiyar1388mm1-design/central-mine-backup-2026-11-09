import { api } from '../lib/apiClient'

export type CardSummaryRo = {
  walletId: string
  cardNumber: string
  rawCardNumber: string
  baseVolumeLth: string
  stakedLth: string
  withdrawableIrr: string
  rawWithdrawableIrr: string
  totalLth: string
  totalIrr: string
  amountTmn: string
  amountToman: string
}

export type Erc1156PositionRo = {
  id: string
  tokenId: string
  motherId: string
  amountLth: string
  accruedStakeLth: string
  status: string
  createdAt: string
}

export type WalletTransactionRo = {
  id: string
  type: string
  amountLth: string
  amountIrr: string
  feeIrr: string
  status: string
  createdAt: string
}

export async function getCardSummary(): Promise<CardSummaryRo> {
  return api.get<CardSummaryRo>('/wallet/card-summary')
}

export async function getUserPositions(): Promise<Erc1156PositionRo[]> {
  return api.get<Erc1156PositionRo[]>('/wallet/positions')
}

export async function getUserTransactions(): Promise<WalletTransactionRo[]> {
  return api.get<WalletTransactionRo[]>('/wallet/transactions')
}

export async function buyPackage(data: { irrAmount?: string; tomanAmount?: string }) {
  return api.post<{ success: boolean; tokenId: string; boughtLth: string }>('/wallet/buy-package', data)
}

export async function sellPosition(data: { tokenId: string; sellAmountLth: string }) {
  return api.post<{ success: boolean; netIrrToUser: string }>('/wallet/sell-position', data)
}

export async function transferP2P(data: { targetCardNumber: string; amountLth: string }) {
  return api.post<{ success: boolean; targetCardNumber: string }>('/wallet/transfer-p2p', data)
}

export async function requestWithdrawal(data: { amountIrr: string; shebaNumber: string }) {
  return api.post<{ success: boolean; withdrawalId: string; status: string }>('/wallet/withdraw', data)
}

export async function inquiryCard(cardNumber: string) {
  return api.get<{ isValid: boolean; targetCardNumber: string; walletId: string }>(`/wallet/inquiry-card/${cardNumber}`)
}