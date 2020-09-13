export class JournalVenteModel {
  codeJournal: string
  dateCreation: Date
  numeroCompte: string
  numeroPiece: string
  nomClient: string
  debit: number
  credit: number
}

export class PagedJournalVenteList {
  totalItems: number
  pageNumber: number
  pageSize: number
  list: JournalVenteModel[]
}

export class JournalBanqueModel {
  codeJournal: string
  datePaiement: Date
  numeroCompte: string
  numeroPiece: string
  tiers: string
  debit: number
  credit: number
  typePaiement: string
}

export class PagedJournalBanqueList {
  totalItems: number
  pageNumber: number
  pageSize: number
  list: JournalBanqueModel[]
}