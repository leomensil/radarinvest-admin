import { z } from "zod";

const HealthResponse = z.object({ status: z.literal("ok") }).passthrough();

const ReadinessResponse = z
  .object({ status: z.enum(["ok", "degraded"]), checks: z.record(z.boolean()) })
  .passthrough();

const ErrorEnvelope = z
  .object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z
          .object({ field: z.string(), issue: z.string() })
          .partial()
          .passthrough()
      )
      .optional(),
    requestId: z.string().uuid(),
  })
  .passthrough();

const RegisterRequest = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
  })
  .passthrough();

const AuthTokens = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int(),
  })
  .passthrough();

const LoginRequest = z
  .object({ email: z.string().email(), password: z.string() })
  .passthrough();

const User = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    name: z.string(),
    role: z.enum(["USER", "AUDITOR", "SUPPORT", "SUPER_ADMIN"]),
    trialEndsAt: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();

const BillingCapability = z
  .object({
    key: z.string(),
    allowed: z.boolean(),
    source: z.enum([
      "ALWAYS_READ",
      "TRIAL",
      "SUBSCRIPTION",
      "ADMIN_ROLE",
      "DENIED",
      "ADDON_PENDING",
    ]),
    note: z.string().optional(),
  })
  .passthrough();

const BillingAddon = z
  .object({
    id: z.string(),
    version: z.number().int(),
    status: z.enum(["POLICY_PENDING", "INACTIVE", "ACTIVE"]),
    requiresBaseSubscription: z.boolean().optional(),
    note: z.string().optional(),
  })
  .passthrough();

const PaymentProviderStub = z
  .object({
    configured: z.boolean(),
    mode: z.enum(["NONE", "TEST_ONLY", "LIVE"]),
    provider: z.string().nullish(),
    note: z.string().optional(),
  })
  .passthrough();

const BillingStatus = z
  .object({
    plan: z.enum(["CORE", "EXPERT"]),
    status: z.enum(["trialing", "active", "past_due", "canceled", "expired"]),
    writeEnabled: z.boolean(),
    mode: z.enum(["TRIAL_ACTIVE", "SUBSCRIBED", "CONSULTATION"]),
    trialStartedAt: z.string().datetime({ offset: true }).nullish(),
    trialEndsAt: z.string().datetime({ offset: true }).nullish(),
    currentPeriodEnd: z.string().datetime({ offset: true }).nullish(),
    exportUntil: z.string().datetime({ offset: true }).nullish(),
    consultationExplanation: z.string().optional(),
    capabilities: z.array(BillingCapability),
    addons: z.array(BillingAddon),
    paymentProvider: PaymentProviderStub,
    openDecisions: z.array(z.string()).optional(),
  })
  .passthrough();

const Portfolio = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const PortfolioCreate = z.object({ name: z.string() }).passthrough();

const Decimal = z.string();

const WealthValuationComposition = z
  .object({
    listedEquityMarket: Decimal,
    treasuryMarket: Decimal,
    fixedIncomeCarry: Decimal,
    mixNote: z.literal("COMBINED_MARKET_AND_CARRY"),
    fixedIncomeIncompleteCount: z.number().int().optional(),
    treasuryIncompleteCount: z.number().int().optional(),
  })
  .passthrough();

const PortfolioWealthSummary = z
  .object({
    marketValue: Decimal,
    costBasis: Decimal,
    unrealizedPnl: Decimal,
    creditedIncome12m: Decimal,
    cashBalance: Decimal.optional(),
    twrPercent: Decimal.optional(),
    mwrrPercent: Decimal.optional(),
    valuationComposition: WealthValuationComposition.optional(),
  })
  .passthrough();

const PortfolioWealthPoint = z
  .object({
    asOf: z.string(),
    marketValue: Decimal,
    costBasis: Decimal,
    creditedIncome: Decimal.optional(),
  })
  .passthrough();

const AssetClass = z.enum([
  "EQUITY",
  "FII",
  "FII_AGRO",
  "ETF",
  "BDR",
  "TREASURY",
  "FIXED_INCOME_PRIVATE",
  "DERIVATIVE",
]);

const AllocationByClass = z
  .object({
    assetClass: AssetClass,
    marketValue: Decimal,
    weightPercent: Decimal,
  })
  .passthrough();

const AllocationBySector = z
  .object({ sector: z.string(), marketValue: Decimal, weightPercent: Decimal })
  .passthrough();

const AllocationByIndexer = z
  .object({
    indexer: z.enum([
      "PRE",
      "CDI_PERCENT",
      "CDI_SPREAD",
      "IPCA_SPREAD",
      "SELIC_OVER",
      "IPCA_PLUS",
      "UNCLASSIFIED",
      "OUTSIDE_INDEXER_DIM",
    ]),
    label: z.string().optional(),
    marketValue: Decimal,
    weightPercent: Decimal,
  })
  .passthrough();

const AllocationMeta = z
  .object({
    classificationAsOf: z.string(),
    sectorSource: z.literal("ASSET_SECTOR_FIELD"),
    cashExcludedFromWeights: z.boolean(),
    investedMarketValue: Decimal,
    cashBalance: Decimal.optional(),
    partialCoverage: z.boolean().optional(),
    unclassifiedSectorMarketValue: Decimal.optional(),
    classifiedSectorWeightPercent: Decimal.optional(),
    sectorCoverageNote: z.string().nullish(),
    limitations: z.array(z.string()).optional(),
  })
  .passthrough();

const PortfolioWealth = z
  .object({
    summary: PortfolioWealthSummary,
    series: z.array(PortfolioWealthPoint),
    allocationByClass: z.array(AllocationByClass),
    allocationBySector: z.array(AllocationBySector).optional(),
    allocationByIndexer: z.array(AllocationByIndexer).optional(),
    allocationMeta: AllocationMeta.optional(),
  })
  .passthrough();

const WealthScope = z
  .object({
    mode: z.enum(["single", "subset", "all"]),
    portfolioIds: z.array(z.string().uuid()),
  })
  .passthrough();

const WealthCoverage = z
  .object({
    quotesAsOf: z.string().nullish(),
    quoteSource: z.string().nullish(),
    partialCoverage: z.boolean(),
    portfolios: z
      .array(
        z
          .object({
            portfolioId: z.string().uuid(),
            historyFrom: z.string().nullish(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

const UserConsolidatedWealth = PortfolioWealth.and(
  z
    .object({
      portfolioCount: z.number().int(),
      scope: WealthScope,
      coverage: WealthCoverage.optional(),
      analyticsUnavailableReason: z.string().nullish(),
    })
    .passthrough()
);

const PortfolioReturnBenchmark = z
  .object({
    code: z.enum(["CDI", "IPCA", "IBOV", "IFIX"]),
    nature: z.enum(["TOTAL_RETURN_SYNTH", "INFLATION_INDEX", "PRICE_INDEX"]),
    source: z.string(),
    returnPercent: Decimal,
    status: z.enum(["OK", "UNAVAILABLE", "PARTIAL_COVERAGE"]),
    unit: z.string().nullish(),
    calendar: z.string().nullish(),
  })
  .passthrough();

const PortfolioReturnMonth = z
  .object({
    month: z.string(),
    twrPercent: Decimal,
    mwrrPercent: Decimal,
    appreciationPercent: Decimal.optional(),
    incomePercent: Decimal.optional(),
  })
  .passthrough();

const PortfolioReturns = z
  .object({
    twrPercent: Decimal,
    mwrrPercent: Decimal,
    mwrrSimplePercent: Decimal.optional(),
    mwrrIrrPercent: Decimal.optional(),
    mwrrIrrStatus: z
      .enum(["OK", "NO_SOLUTION", "NOT_APPLICABLE", "UNAVAILABLE"])
      .nullish(),
    method: z.enum(["TWR_EVENT", "TWR_UNAVAILABLE"]),
    coverage: z
      .object({
        status: z.enum([
          "OK",
          "INSUFFICIENT_HISTORY",
          "COST_UNKNOWN",
          "PARTIAL_COVERAGE",
          "UNAVAILABLE",
        ]),
        bases: z.array(
          z.enum(["EQUITY_CLOSE", "FIXED_INCOME_CARRY", "TREASURY_PU", "CASH"])
        ),
        effectiveFrom: z.string().nullish(),
        effectiveTo: z.string().nullish(),
        limitations: z.array(z.string()),
      })
      .passthrough(),
    benchmarks: z.array(PortfolioReturnBenchmark).optional(),
    asOf: z.string().optional(),
    appreciationPercent: Decimal.optional(),
    incomePercent: Decimal.optional(),
    realizedPnl: Decimal.optional(),
    monthly: z.array(PortfolioReturnMonth).optional(),
  })
  .passthrough();

const TwrSeriesPoint = z
  .object({
    asOf: z.string(),
    twrPercentCumulative: Decimal.optional(),
    status: z.enum([
      "OK",
      "PARTIAL_COVERAGE",
      "UNAVAILABLE",
      "INSUFFICIENT_HISTORY",
    ]),
  })
  .passthrough();

const PortfolioReturnsLevel = z
  .object({
    level: z.enum(["portfolio", "class", "asset"]),
    key: z.string(),
    ticker: z.string().optional(),
    assetId: z.string().uuid().optional(),
    assetClass: AssetClass.optional(),
    marketValue: Decimal.optional(),
    quantity: Decimal.optional(),
    unrealizedPnl: Decimal.optional(),
    twrPercent: Decimal.optional(),
    mwrrPercent: Decimal.optional(),
    mwrrSimplePercent: Decimal.optional(),
    mwrrIrrPercent: Decimal.optional(),
    mwrrIrrStatus: z
      .enum(["OK", "NO_SOLUTION", "NOT_APPLICABLE", "UNAVAILABLE"])
      .nullish(),
    method: z.enum(["TWR_EVENT", "TWR_UNAVAILABLE"]),
    series: z.array(TwrSeriesPoint).optional(),
    coverage: z.object({}).partial().passthrough(),
  })
  .passthrough();

const PortfolioPerformanceChart = z
  .object({
    nature: z.literal("PORTFOLIO_TWR_EVENT_BASED"),
    notWealthDelta: z.boolean(),
    valuationMix: z.string().nullable(),
    bases: z.array(z.string()),
    limitations: z.array(z.string()),
    series: z.array(
      z
        .object({
          asOf: z.string(),
          portfolioTwrCumulative: Decimal.optional(),
          byClass: z.record(Decimal).optional(),
          status: z.enum(["OK", "UNAVAILABLE", "PARTIAL_COVERAGE"]),
        })
        .passthrough()
    ),
    benchmarks: z.array(z.object({}).partial().passthrough()),
    cdiPeriodReturnPercent: Decimal,
  })
  .partial()
  .passthrough();

const ScopedPortfolioReturns = PortfolioReturns.and(
  z
    .object({
      portfolioIds: z.array(z.string().uuid()),
      scope: z
        .object({
          mode: z.enum(["single", "subset", "all"]),
          portfolioIds: z.array(z.string().uuid()),
        })
        .partial()
        .passthrough()
        .optional(),
      portfolio: PortfolioReturnsLevel.optional(),
      byClass: z.array(PortfolioReturnsLevel).optional(),
      byAsset: z.array(PortfolioReturnsLevel).optional(),
      performanceChart: PortfolioPerformanceChart.optional(),
      analyticsUnavailableReason: z.string().nullish(),
    })
    .passthrough()
);

const PortfolioPositionSlice = z
  .object({
    portfolioId: z.string().uuid(),
    portfolioName: z.string(),
    quantity: Decimal,
    costBasis: Decimal.optional(),
    costKnown: z.boolean(),
    marketValue: Decimal.optional(),
  })
  .passthrough();

const ConsolidatedEnrichedPosition = z
  .object({
    assetId: z.string().uuid(),
    ticker: z.string(),
    assetClass: AssetClass,
    quantity: Decimal,
    costBasis: Decimal.optional(),
    costKnown: z.boolean(),
    avgCost: Decimal.optional(),
    marketValue: Decimal.optional(),
    breakdown: z.array(PortfolioPositionSlice),
  })
  .passthrough();

const ScopedPositionsResponse = z
  .object({
    scope: WealthScope,
    coverage: WealthCoverage,
    positions: z.array(ConsolidatedEnrichedPosition),
  })
  .passthrough();

const reconcileScopedPortfolios_Body = z
  .object({ portfolioIds: z.array(z.string().uuid()) })
  .partial()
  .passthrough();

const ScopedReconcileResult = z
  .object({
    jobs: z.array(
      z
        .object({
          portfolioId: z.string().uuid(),
          jobId: z.string(),
          status: z.enum([
            "pending",
            "processing",
            "completed",
            "failed",
            "interrupted",
          ]),
        })
        .passthrough()
    ),
    failed: z.array(
      z
        .object({ portfolioId: z.string().uuid(), error: z.string() })
        .passthrough()
    ),
  })
  .passthrough();

const PortfolioTransferCreate = z
  .object({
    toPortfolioId: z.string().uuid(),
    ticker: z.string(),
    quantity: Decimal,
    tradeDate: z.string(),
    custodian: z.string().optional(),
  })
  .passthrough();

const LedgerEventType = z.enum([
  "BUY",
  "SELL",
  "BONUS",
  "SPLIT",
  "REVERSE_SPLIT",
  "SUBSCRIPTION",
  "AMORTIZATION",
  "CUSTODY_TRANSFER",
  "PORTFOLIO_TRANSFER_OUT",
  "PORTFOLIO_TRANSFER_IN",
  "INITIAL_POSITION",
]);

const GrossAmountOrigin = z.enum(["INFORMED", "DERIVED"]);

const Transaction = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    ticker: z.string(),
    assetClass: AssetClass.optional(),
    eventType: LedgerEventType,
    quantity: Decimal,
    unitPrice: Decimal,
    costs: Decimal,
    costBasisUnknown: z.boolean().optional(),
    grossAmount: Decimal.optional(),
    grossAmountOrigin: GrossAmountOrigin.optional(),
    grossAmountScaleWarning: z.string().optional(),
    tradeDate: z.string(),
    custodian: z.string().optional(),
    fromCustodian: z.string().optional(),
    toCustodian: z.string().optional(),
    reversesTransactionId: z.string().uuid().optional(),
  })
  .passthrough();

const PortfolioTransferResult = z
  .object({
    transferPairId: z.string().uuid(),
    out: Transaction,
    in: Transaction,
  })
  .passthrough();

const TransactionCreate = z
  .object({
    ticker: z.string(),
    eventType: LedgerEventType,
    quantity: Decimal,
    unitPrice: Decimal,
    costs: Decimal.optional(),
    grossAmount: Decimal.optional(),
    grossAmountOrigin: GrossAmountOrigin.optional(),
    confirmGrossDivergence: z.boolean().optional(),
    tradeDate: z.string(),
    custodian: z.string().optional(),
    fromCustodian: z.string().optional(),
    toCustodian: z.string().optional(),
    reversesTransactionId: z.string().uuid().optional(),
    costBasisUnknown: z.boolean().optional(),
  })
  .passthrough();

const TransactionUpdate = z
  .object({
    ticker: z.string(),
    eventType: LedgerEventType,
    quantity: Decimal,
    unitPrice: Decimal,
    costs: Decimal,
    grossAmount: Decimal,
    grossAmountOrigin: GrossAmountOrigin,
    confirmGrossDivergence: z.boolean(),
    tradeDate: z.string(),
    custodian: z.string().nullable(),
    fromCustodian: z.string().nullable(),
    toCustodian: z.string().nullable(),
  })
  .partial()
  .passthrough();

const TransactionMove = z
  .object({ toPortfolioId: z.string().uuid() })
  .passthrough();

const Provenance = z
  .object({
    source: z.string(),
    capturedAt: z.string().datetime({ offset: true }),
    integrityIndex: z.number().gte(0).lte(1),
  })
  .passthrough();

const CustodianQuantity = z
  .object({ custodian: z.string(), quantity: Decimal })
  .passthrough();

const Position = z
  .object({
    ticker: z.string(),
    quantity: Decimal,
    avgCost: Decimal.optional(),
    costKnown: z.boolean(),
    unknownQuantity: Decimal.optional(),
    knownQuantity: Decimal.optional(),
    knownTotalCost: Decimal.optional(),
    freeQuantity: Decimal,
    marketPrice: Decimal.optional(),
    marketPriceProvenance: Provenance.optional(),
    unrealizedPnl: Decimal.optional(),
    assetClass: AssetClass.optional(),
    marketValue: Decimal.optional(),
    costBasis: Decimal.optional(),
    weightPercent: Decimal.optional(),
    weightClassPercent: Decimal.optional(),
    weightSectorPercent: Decimal.optional(),
    sector: z.string().nullish(),
    dividendYield: Decimal.optional(),
    yocPercent: Decimal.optional(),
    pl: Decimal.optional(),
    devaluation: z.boolean().optional(),
    quantityByCustodian: z.array(CustodianQuantity).optional(),
  })
  .passthrough();

const AssetCustodyBucket = z
  .object({ custodian: z.string(), quantity: Decimal })
  .passthrough();

const createImportJob_Body = z
  .object({
    kind: z.enum(["SINACOR_PDF", "CSV", "XLSX"]),
    ledgerMode: z.enum(["historical", "initial_position"]).optional(),
    cutDate: z.string().optional(),
    confirmEmbeddedHistory: z.string().optional(),
    file: z.instanceof(File),
  })
  .passthrough();

const ImportPreviewRow = z
  .object({
    line: z.number().int(),
    ticker: z.string().optional(),
    eventType: LedgerEventType.optional(),
    quantity: Decimal.optional(),
    unitPrice: Decimal.optional(),
    costs: Decimal.optional(),
    tradeDate: z.string().optional(),
    custodian: z.string().optional(),
    valid: z.boolean(),
    error: z.string().nullish(),
    costBasisUnknown: z.boolean().optional(),
    limitations: z.array(z.string()).optional(),
    possibleDuplicate: z.boolean().optional(),
    grossAmount: Decimal.optional(),
    assetClass: AssetClass.optional(),
    treasuryBondType: z.string().optional(),
    treasuryMaturity: z.string().optional(),
  })
  .passthrough();

const ImportColumnMapping = z
  .object({
    ticker: z.number().int().gte(0),
    eventType: z.number().int().gte(0),
    quantity: z.number().int().gte(0),
    unitPrice: z.number().int().gte(0),
    tradeDate: z.number().int().gte(0),
    costs: z.number().int().gte(0).optional(),
    custodian: z.number().int().gte(0).optional(),
  })
  .passthrough();

const ImportJob = z
  .object({
    id: z.string().uuid(),
    kind: z.enum(["SINACOR_PDF", "CSV", "XLSX"]),
    ledgerMode: z.enum(["historical", "initial_position"]).optional(),
    cutDate: z.string().nullish(),
    status: z.enum([
      "pending",
      "parsing",
      "awaiting_mapping",
      "preview",
      "committing",
      "succeeded",
      "failed",
      "cancelled",
    ]),
    previewRowCount: z.number().int().optional(),
    previewRows: z.array(ImportPreviewRow).optional(),
    rawHeaders: z.array(z.string()).optional(),
    rawSampleRows: z.array(z.array(z.string())).optional(),
    columnMapping: ImportColumnMapping.optional(),
    errorMessage: z.string().nullish(),
  })
  .passthrough();

const ImportColumnMappingRequest = z
  .object({ columnMapping: ImportColumnMapping })
  .passthrough();

const FinancialInstitution = z
  .object({
    id: z.string().uuid().optional(),
    code: z.string(),
    name: z.string(),
    fullName: z.string().optional(),
    cnpj: z.string().optional(),
    active: z.boolean(),
  })
  .passthrough();

const AssetSearchHit = z
  .object({
    ticker: z.string(),
    name: z.string(),
    assetClass: AssetClass,
    sector: z.string().nullish(),
  })
  .passthrough();

const EquityMetrics = z
  .object({
    kind: z.literal("EQUITY"),
    lpa: Decimal,
    vpa: Decimal,
    roe: Decimal,
    pl: Decimal,
    pvp: Decimal,
    evEbit: Decimal,
    evEbitda: Decimal,
    roic: Decimal,
    roce: Decimal,
    margemBruta: Decimal,
    margemEbitda: Decimal,
    margemEbit: Decimal,
    margemLiquida: Decimal,
    dlEbitda: Decimal,
    payout: Decimal,
  })
  .partial()
  .passthrough();

const FiiMetricsPanel = z
  .object({
    kind: z.literal("FII"),
    vacanciaFisica: Decimal,
    vacanciaFinanceira: Decimal,
    vacanciaPonderada: Decimal,
    capRate: Decimal,
    waultMonths: Decimal,
    pvp: Decimal,
    tenantConcentrationTopN: Decimal,
    atypicalContractsPct: Decimal,
    noiAnnualizedProjected: Decimal,
    physicalPortfolioEv: Decimal,
  })
  .partial()
  .passthrough();

const EtfMetrics = z
  .object({
    kind: z.literal("ETF"),
    lastClose: Decimal,
    dividendYield: Decimal,
  })
  .partial()
  .passthrough();

const FiiHealthScore = z
  .object({
    passed: z.boolean(),
    gates: z.array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          passed: z.boolean(),
          observed: Decimal,
          threshold: z.string(),
        })
        .passthrough()
    ),
  })
  .passthrough();

const AssetIncomeMetrics = z
  .object({
    dividendYield: Decimal,
    dividendYieldProjected: Decimal,
    dpa3y: Decimal,
    dpa5y: Decimal,
  })
  .partial()
  .passthrough();

const AssetSheet = z
  .object({
    ticker: z.string(),
    assetClass: z.enum([
      "EQUITY",
      "FII",
      "FII_AGRO",
      "ETF",
      "BDR",
      "TREASURY",
      "FIXED_INCOME_PRIVATE",
      "DERIVATIVE",
    ]),
    name: z.string(),
    metrics: z
      .union([
        EquityMetrics,
        FiiMetricsPanel,
        EtfMetrics,
        z.object({}).partial().passthrough(),
      ])
      .optional(),
    fiiHealthScore: FiiHealthScore.optional(),
    income: AssetIncomeMetrics.optional(),
    provenance: Provenance.optional(),
  })
  .passthrough();

const AssetCompareResponse = z
  .object({ assetClass: AssetClass, items: z.array(AssetSheet) })
  .passthrough();

const PriceClose = z
  .object({ date: z.string(), close: Decimal, provenance: Provenance })
  .passthrough();

const DividendCustodianShare = z
  .object({
    custodian: z.string(),
    quantity: Decimal,
    amountGross: Decimal,
    amountNet: Decimal,
  })
  .passthrough();

const DividendView = z
  .object({
    dividendId: z.string().uuid().optional(),
    receiptStatus: z.enum(["NONE", "PROVISIONED", "CREDITED"]).optional(),
    receiptId: z.string().uuid().nullish(),
    ticker: z.string(),
    nature: z.enum(["DIVIDEND", "JCP", "FII_INCOME", "AMORTIZATION"]),
    lifecycleState: z.enum(["ANNOUNCED", "EX_NO_RIGHT", "CREDITED"]),
    comDate: z.string().optional(),
    exDate: z.string().optional(),
    payDate: z.string().optional(),
    amountGross: Decimal,
    amountNet: Decimal,
    nonRecurring: z.boolean().optional().default(false),
    custodians: z.array(DividendCustodianShare).optional(),
  })
  .passthrough();

const DividendReceipt = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    dividendId: z.string().uuid(),
    status: z.enum(["PROVISIONED", "CREDITED"]),
    quantityAtCom: Decimal,
    amountGross: Decimal,
    amountNet: Decimal,
    creditedAt: z.string().datetime({ offset: true }).nullish(),
    custodian: z.string().optional(),
  })
  .passthrough();

const YieldOnCost = z
  .object({ ticker: z.string(), yocPercent: Decimal, provenance: Provenance })
  .passthrough();

const DividendSeasonality = z
  .object({
    year: z.number().int(),
    cells: z.array(
      z
        .object({
          ticker: z.string(),
          month: z.number().int().gte(1).lte(12),
          amountNet: Decimal,
        })
        .passthrough()
    ),
  })
  .passthrough();

const DividendProjection = z
  .object({
    disclaimer: z.string(),
    items: z.array(
      z
        .object({
          ticker: z.string(),
          nature: z.enum(["DIVIDEND", "JCP", "FII_INCOME", "AMORTIZATION"]),
          amountNet: Decimal,
          payDate: z.string().optional(),
          lifecycleState: z.enum(["ANNOUNCED", "EX_NO_RIGHT", "CREDITED"]),
        })
        .passthrough()
    ),
  })
  .passthrough();

const EttjCurveKind = z.enum(["PREFIXED", "REAL"]);

const EttjNssView = z
  .object({
    curveDate: z.string(),
    curveKind: EttjCurveKind,
    beta0: Decimal,
    beta1: Decimal,
    beta2: Decimal,
    beta3: Decimal,
    tau1: Decimal,
    tau2: Decimal,
    provenance: Provenance.optional(),
  })
  .passthrough();

const TreasuryShock = z
  .object({ bps: z.number().int(), puDelta: Decimal, valueDelta: Decimal })
  .passthrough();

const TreasuryView = z
  .object({
    id: z.string().uuid(),
    bondType: z.string(),
    maturity: z.string(),
    quantity: Decimal,
    contractedRate: Decimal,
    marketPu: Decimal.optional(),
    marketValue: Decimal.optional(),
    marketPuProvenance: Provenance.optional(),
    curvePu: Decimal.optional(),
    ettjPu: Decimal.optional(),
    exitSpread: Decimal.optional(),
    ettjSpread: Decimal.optional(),
    vna: Decimal.optional(),
    shocks: z.array(TreasuryShock).nullish(),
  })
  .passthrough();

const TreasurySpecies = z.enum([
  "PREFIXADO_ZERO",
  "SELIC",
  "IPCA_PLUS",
  "PREFIXADO_COUPON",
  "IPCA_PLUS_COUPON",
  "RENDA_MAIS",
  "EDUCA_MAIS",
]);

const TreasuryLotStatus = z.enum(["OPEN", "CLOSED", "SETTLED"]);

const TreasuryEvaluationQuality = z.enum([
  "COST",
  "CARRY_CONTRACTED",
  "CARRY_AT_FACE",
  "CARRY_AT_VNA",
  "OFFICIAL_REDEEM_PU",
  "ETTJ_ESTIMATE",
  "MISSING",
  "GAP",
  "STALE",
  "UNSUPPORTED_PROJECTION",
]);

const TreasuryEvaluationMeta = z
  .object({
    basis: z.enum(["COST", "CARRY", "MARKET", "ETTJ"]),
    quality: TreasuryEvaluationQuality,
    asOf: z.string(),
    source: z.string().nullish(),
    observedAt: z.string().nullish(),
    curveDate: z.string().nullish(),
    reason: z.string().nullish(),
  })
  .passthrough();

const TreasuryLotEvent = z
  .object({
    id: z.string().uuid(),
    eventType: z.enum([
      "BUY",
      "PARTIAL_REDEEM",
      "FULL_REDEEM",
      "SETTLE",
      "SNAPSHOT",
    ]),
    tradeDate: z.string(),
    quantity: Decimal,
    estimatedCarry: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    carryVariance: Decimal.optional(),
  })
  .passthrough();

const TreasuryCouponReceipt = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    lotId: z.string().uuid(),
    nominalDate: z.string(),
    adjustedPaymentDate: z.string(),
    predictedGross: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    variance: Decimal,
    status: z.literal("CREDITED"),
    creditedAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const TreasuryCouponAgendaItem = z
  .object({
    nominalDate: z.string(),
    adjustedPaymentDate: z.string(),
    contractual: z.boolean(),
    eligible: z.boolean(),
    predictedGross: Decimal,
    remainingInCarry: z.boolean().optional(),
    state: z.enum(["SCHEDULED", "RIGHT", "CREDITED", "NOT_ELIGIBLE"]),
    receipt: TreasuryCouponReceipt.optional(),
  })
  .passthrough();

const TreasuryCouponAgenda = z
  .object({
    lotId: z.string().uuid(),
    couponRatePercentAa: Decimal,
    couponSemestralPercent: Decimal.optional(),
    items: z.array(TreasuryCouponAgendaItem),
  })
  .passthrough();

const TreasuryAmortizationReceipt = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    lotId: z.string().uuid(),
    installmentIndex: z.number().int(),
    nominalDate: z.string(),
    adjustedPaymentDate: z.string(),
    taRate: Decimal,
    predictedGross: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    variance: Decimal,
    status: z.literal("CREDITED"),
    creditedAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const TreasuryAmortizationAgendaItem = z
  .object({
    installmentIndex: z.number().int(),
    nominalDate: z.string(),
    adjustedPaymentDate: z.string(),
    taRate: Decimal,
    contractual: z.boolean(),
    eligible: z.boolean(),
    predictedGross: Decimal,
    remainingInCarry: z.boolean(),
    state: z.enum([
      "SCHEDULED",
      "RIGHT",
      "CREDITED",
      "NOT_ELIGIBLE",
      "OUTSIDE_SNAPSHOT",
    ]),
    receipt: TreasuryAmortizationReceipt.optional(),
  })
  .passthrough();

const TreasuryAmortizationAgenda = z
  .object({
    lotId: z.string().uuid(),
    installmentCount: z.union([z.literal(240), z.literal(60)]),
    taRate: Decimal,
    tafRate: Decimal,
    conversionDate: z.string(),
    maturityDate: z.string(),
    phase: z.enum(["ACCUMULATION", "RECEIPT", "ENDED_SCHEDULE"]),
    remainingAmortPercent: Decimal,
    items: z.array(TreasuryAmortizationAgendaItem),
  })
  .passthrough();

const TreasuryLot = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    species: TreasurySpecies,
    bondLabel: z.string(),
    maturityDate: z.string(),
    lotCode: z.string().nullish(),
    tradeDate: z.string(),
    quantityAcquired: Decimal,
    remainingQuantity: Decimal,
    acquisitionPu: Decimal,
    contractedRatePercentAa: Decimal,
    vnaBaseDate: z.string().nullish(),
    costs: Decimal,
    grossAmount: Decimal,
    grossAmountOrigin: z.enum(["INFORMED", "DERIVED"]).optional(),
    custodian: z.string(),
    status: TreasuryLotStatus,
    settledAt: z.string().datetime({ offset: true }).nullish(),
    costBasis: Decimal,
    carryPu: Decimal,
    carryValue: Decimal,
    vna: Decimal.optional(),
    quotation: Decimal.optional(),
    incompletenessReasons: z.array(z.string()).optional(),
    seriesThrough: z.string().nullish(),
    marketPu: Decimal,
    marketValue: Decimal,
    marketPuProvenance: Provenance.optional(),
    marketPuDate: z.string().nullish(),
    ettjPu: Decimal,
    ettjValue: Decimal,
    evaluations: z
      .object({
        cost: TreasuryEvaluationMeta,
        carry: TreasuryEvaluationMeta,
        market: TreasuryEvaluationMeta,
        ettj: TreasuryEvaluationMeta,
      })
      .passthrough(),
    events: z.array(TreasuryLotEvent),
    conversionDate: z.string().nullish(),
    phase: z.enum(["ACCUMULATION", "RECEIPT", "ENDED_SCHEDULE"]).nullish(),
    remainingAmortPercent: Decimal.optional(),
    couponAgenda: TreasuryCouponAgenda.optional(),
    amortAgenda: TreasuryAmortizationAgenda.optional(),
    couponRatePercentAa: Decimal.optional(),
    limitations: z.array(z.string()),
    calendarReview: z
      .object({
        calendar: z.literal("ANBIMA_NATIONAL"),
        source: z.string(),
        inclusiveAsOf: z.boolean(),
        exclusiveMaturity: z.boolean(),
        coverageNote: z.string(),
        asOf: z.string(),
        maturityDate: z.string(),
        du: z.number().int(),
        postMaturity: z.boolean(),
      })
      .partial()
      .passthrough()
      .optional(),
    acquisitionReview: z
      .object({
        calendar: z.literal("ANBIMA_NATIONAL"),
        duAtTrade: z.number().int(),
        theoreticalCarryPu: Decimal,
        acquisitionPu: Decimal,
        acquisitionCarryDifference: Decimal,
      })
      .partial()
      .passthrough()
      .optional(),
  })
  .passthrough();

const TreasuryLotCreate = z
  .object({
    species: TreasurySpecies,
    bondLabel: z.string(),
    maturityDate: z.string(),
    lotCode: z.string().nullish(),
    tradeDate: z.string(),
    quantity: Decimal,
    acquisitionPu: Decimal,
    contractedRatePercentAa: Decimal,
    conversionDate: z.string().optional(),
    couponRatePercentAa: Decimal.optional(),
    vnaBaseDate: z.string().optional(),
    costs: Decimal.optional(),
    grossAmount: Decimal.optional(),
    grossAmountOrigin: z.enum(["INFORMED", "DERIVED"]).optional(),
    custodian: z.string(),
  })
  .passthrough();

const TreasuryLotRedeem = z
  .object({
    tradeDate: z.string(),
    quantity: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
  })
  .passthrough();

const TreasuryLotSettle = z
  .object({
    tradeDate: z.string(),
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
  })
  .passthrough();

const TreasuryCouponReceiptCreate = z
  .object({
    receivedDate: z.string().optional(),
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
  })
  .passthrough();

const TreasuryAmortizationReceiptCreate = z
  .object({
    receivedDate: z.string().optional(),
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
  })
  .passthrough();

const FixedIncomeInstrumentType = z.enum(["CDB", "LCI", "LCA"]);

const FixedIncomeIndexType = z.enum([
  "PRE",
  "CDI_PERCENT",
  "CDI_SPREAD",
  "IPCA_SPREAD",
]);

const FixedIncomeDayCount = z.enum(["BUSINESS_252", "CALENDAR_360"]);

const FixedIncomeLiquidityType = z.enum(["DAILY", "AT_MATURITY"]);

const FixedIncomeContractStatus = z.enum(["OPEN", "CLOSED", "SETTLED"]);

const FixedIncomeSeriesCoverage = z
  .object({
    status: z.enum(["COMPLETE", "GAP", "STALE", "NA", "UNSUPPORTED"]),
    asOfRequested: z.string(),
    seriesThrough: z.string().nullish(),
    code: z.string().nullish(),
  })
  .passthrough();

const FixedIncomeConditionsReview = z
  .object({
    indexType: FixedIncomeIndexType,
    dayCount: FixedIncomeDayCount,
    calendar: z.literal("BR_B3_NATIONAL"),
    inclusiveStart: z.boolean(),
    exclusiveAsOf: z.boolean(),
    preRatePercentAa: Decimal.optional(),
    cdiPercent: Decimal.optional(),
    cdiSpreadPercentAa: Decimal.optional(),
    ipcaSpreadPercentAa: Decimal.optional(),
    startDate: z.string(),
    maturityDate: z.string(),
    liquidityType: FixedIncomeLiquidityType,
    gracePeriodDate: z.string().nullish(),
    seriesKey: z.enum(["CDI_OVER_AA_252", "IPCA_NI"]).nullish(),
    seriesUnit: z.enum(["OVER_PERCENT_AA_252", "NUMBER_INDEX"]).nullish(),
    anniversaryDay: z.number().int().gte(1).lte(31).nullish(),
    ipcaLagMonths: z.union([z.literal(1), z.literal(2)]).nullish(),
    correctionPeriodicity: z.literal("MONTHLY").nullish(),
    correctionType: z.literal("DELAYED_PRICE_INDEX").nullish(),
    ni0ReferenceMonth: z.string().nullish(),
    ninReferenceMonth: z.string().nullish(),
    conventionLimitations: z.string().nullish(),
  })
  .passthrough();

const FixedIncomeEventType = z.enum([
  "APPLY",
  "PARTIAL_REDEEM",
  "FULL_REDEEM",
  "SETTLE",
  "SNAPSHOT",
]);

const FixedIncomeEvent = z
  .object({
    id: z.string().uuid(),
    contractId: z.string().uuid(),
    eventType: FixedIncomeEventType,
    tradeDate: z.string(),
    principalAmount: Decimal,
    estimatedCarry: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    carryVariance: Decimal.optional(),
  })
  .passthrough();

const FixedIncomeContract = z
  .object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    instrumentType: FixedIncomeInstrumentType,
    issuerId: z.string().uuid(),
    issuerName: z.string(),
    issuerCnpj: z.string().nullish(),
    custodianInstitutionId: z.string().uuid(),
    custodian: z.string(),
    principal: Decimal,
    remainingPrincipal: Decimal,
    preRatePercentAa: Decimal.optional(),
    cdiPercent: Decimal.optional(),
    cdiSpreadPercentAa: Decimal.optional(),
    ipcaSpreadPercentAa: Decimal.optional(),
    ipcaLagMonths: z.union([z.literal(1), z.literal(2)]).nullish(),
    indexType: FixedIncomeIndexType,
    dayCount: FixedIncomeDayCount,
    issueDate: z.string(),
    startDate: z.string(),
    maturityDate: z.string(),
    gracePeriodDate: z.string().nullish(),
    liquidityType: FixedIncomeLiquidityType,
    status: FixedIncomeContractStatus,
    settledAt: z.string().datetime({ offset: true }).nullish(),
    internalCarry: Decimal,
    displayedEvaluation: Decimal,
    observedCarry: Decimal.optional(),
    carriedAmount: Decimal.optional(),
    projectionStatus: z.literal("NONE"),
    seriesCoverage: FixedIncomeSeriesCoverage,
    evaluationBasis: z.literal("CARRY"),
    maturityDateReached: z.boolean(),
    conditionsReview: FixedIncomeConditionsReview,
    events: z.array(FixedIncomeEvent).optional(),
  })
  .passthrough();

const FixedIncomeContractCreate = z
  .object({
    instrumentType: FixedIncomeInstrumentType,
    issuerName: z.string(),
    issuerCnpj: z.string().nullish(),
    custodian: z.string(),
    principal: Decimal,
    preRatePercentAa: Decimal.optional(),
    cdiPercent: Decimal.optional(),
    cdiSpreadPercentAa: Decimal.optional(),
    ipcaSpreadPercentAa: Decimal.optional(),
    ipcaLagMonths: z.union([z.literal(1), z.literal(2)]).optional(),
    indexType: FixedIncomeIndexType.optional(),
    dayCount: FixedIncomeDayCount.optional(),
    issueDate: z.string(),
    startDate: z.string(),
    maturityDate: z.string(),
    gracePeriodDate: z.string().nullish(),
    liquidityType: FixedIncomeLiquidityType,
  })
  .passthrough();

const FixedIncomeRedemptionCreate = z
  .object({
    principalAmount: Decimal,
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    tradeDate: z.string(),
  })
  .passthrough();

const FixedIncomeSettlementCreate = z
  .object({
    grossReceived: Decimal,
    netReceived: Decimal.optional(),
    tradeDate: z.string(),
  })
  .passthrough();

const ValuationMethod = z.enum([
  "BAZIN",
  "GRAHAM_CLASSIC",
  "GRAHAM_ETTJ",
  "GORDON",
  "SECTOR_MULTIPLES",
  "EARNINGS_YIELD",
]);

const CeilingPriceRequest = z
  .object({
    ticker: z.string(),
    methods: z.array(ValuationMethod),
    safetyMargin: Decimal,
  })
  .passthrough();

const CeilingPriceResponse = z
  .object({
    ticker: z.string(),
    results: z.array(
      z
        .object({
          method: ValuationMethod,
          status: z.enum(["OK", "INAPPLICABLE"]),
          ceiling: Decimal.optional(),
          provenance: Provenance.optional(),
        })
        .passthrough()
    ),
    opportunity: z.boolean(),
    safetyMarginApplied: Decimal.optional(),
    observedMargins: z
      .array(
        z
          .object({
            method: ValuationMethod,
            status: z.enum(["OK", "INAPPLICABLE"]),
            margin: Decimal.optional(),
            quote: Decimal.optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

const AlertTaxonomy = z.enum([
  "DETERIORATION",
  "DEVALUATION",
  "STRUCTURAL_TREND",
  "ENTRY_OPPORTUNITY",
]);

const Alert = z
  .object({
    id: z.string().uuid(),
    ticker: z.string().optional(),
    taxonomy: AlertTaxonomy,
    fact: z.string(),
    rationale: z.string(),
    guidance: z.string(),
    emittedAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const SuitabilityProfile = z
  .object({
    riskProfile: z.enum(["CONSERVATIVE", "MODERATE", "BOLD", "AGGRESSIVE"]),
    philosophy: z.enum([
      "BESST",
      "VALUE",
      "DIVIDEND_GROWTH",
      "DEEP_VALUE",
      "PASSIVE_INDEX",
    ]),
    horizon: z.enum(["SHORT", "MEDIUM", "LONG"]),
    goalType: z.enum(["WEALTH_ACCUMULATION", "PASSIVE_INCOME"]),
  })
  .passthrough();

const FeatureGate = z
  .object({
    feature: z.string(),
    enabled: z.boolean(),
    plan: z.enum(["CORE", "EXPERT"]).optional(),
  })
  .passthrough();

const ExportJob = z
  .object({
    id: z.string().uuid(),
    status: z.enum(["pending", "running", "succeeded", "failed"]),
    format: z.enum(["CSV", "XLSX", "PDF"]).optional(),
    portfolioIds: z.array(z.string().uuid()).optional(),
    downloadUrl: z.string().url().nullish(),
  })
  .passthrough();

const exportScope_Body = z
  .object({
    format: z.enum(["CSV", "XLSX"]),
    portfolioIds: z.array(z.string().uuid()).min(1),
  })
  .passthrough();

const DiagnoseRequest = z
  .object({
    portfolioId: z.string().uuid(),
    alertId: z.string().uuid().nullish(),
    question: z.string().optional(),
  })
  .passthrough();

const DiagnosisOutput = z
  .object({
    fact: z.string(),
    rationale: z.string(),
    guidance: z.string(),
    disclaimers: z.array(z.string()),
    forbiddenTermsHit: z.boolean(),
    citations: z.array(
      z.object({ path: z.string(), label: z.string().optional() }).passthrough()
    ),
  })
  .passthrough();

const DividendInconsistency = z
  .object({
    ticker: z.string(),
    code: z.enum([
      "MISSING_PAY_DATE",
      "NEGATIVE_NET",
      "PHASE_ORDER",
      "DUPLICATE_EX",
    ]),
    message: z.string(),
    severity: z.enum(["INFO", "WARN", "ERROR"]),
    dividendId: z.string().uuid().nullish(),
  })
  .passthrough();

const FixedIncomeRedemptionSimRequest = z
  .object({
    principal: Decimal,
    rateAnnual: Decimal,
    daysHeld: z.number().int().gte(1),
    iofTableDay: z.number().int().gte(0).lte(30),
  })
  .passthrough();

const FixedIncomeRedemptionSimResponse = z
  .object({
    grossInterest: Decimal,
    iof: Decimal,
    ir: Decimal,
    netProceeds: Decimal,
    effectiveRate: Decimal,
  })
  .passthrough();

const EquityGainsResponse = z
  .object({
    yearMonth: z.string(),
    soldTotal: Decimal,
    taxableGain: Decimal,
    exemptUnder20k: z.boolean(),
    irDue: Decimal,
  })
  .passthrough();

const TreasuryPuPoint = z
  .object({ asOf: z.string(), marketPu: Decimal, carryPu: Decimal })
  .passthrough();

const TreasuryBondHistory = z
  .object({
    bondType: z.string(),
    maturity: z.string(),
    points: z.array(TreasuryPuPoint),
  })
  .passthrough();

const TreasuryHistoryResponse = z
  .object({ series: z.array(TreasuryBondHistory) })
  .passthrough();

const TreasuryDurationView = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    macaulayYears: Decimal,
    modifiedDuration: Decimal,
    dv01: Decimal,
  })
  .passthrough();

const AllocationSuggestionRequest = z
  .object({ amount: Decimal, targetEquityPct: Decimal.optional() })
  .passthrough();

const AllocationSuggestionResponse = z
  .object({
    suggestions: z.array(
      z
        .object({ ticker: z.string(), amount: Decimal, rationale: z.string() })
        .passthrough()
    ),
  })
  .passthrough();

const WatchlistItem = z
  .object({
    ticker: z.string(),
    assetClass: z.enum(["EQUITY", "FII", "BDR", "ETF", "TREASURY"]),
    name: z.string().optional(),
  })
  .passthrough();

const MarketClosesIngestRequest = z
  .object({
    rows: z
      .array(
        z
          .object({
            ticker: z.string(),
            date: z.string(),
            close: Decimal,
            source: z.string(),
          })
          .passthrough()
      )
      .min(1),
  })
  .passthrough();

const PrivacyEraseResponse = z
  .object({
    status: z.literal("scheduled"),
    purgeAfter: z.string().datetime({ offset: true }),
  })
  .passthrough();

const PortfolioRiskMetrics = z
  .object({
    status: z.enum([
      "OK",
      "INSUFFICIENT_HISTORY",
      "NOT_COMPARABLE_CARRY",
      "PARTIAL_COVERAGE",
      "UNAVAILABLE",
    ]),
    asOf: z.string().optional(),
    window: z
      .object({
        from: z.string().nullable(),
        to: z.string().nullable(),
        returnCount: z.number().int(),
        minRequired: z.number().int(),
        frequency: z.literal("DAILY"),
        annualization: z.literal("SQRT_252"),
      })
      .partial()
      .passthrough()
      .optional(),
    volatilityAnnualizedPercent: Decimal.optional(),
    maxDrawdownPercent: Decimal.optional(),
    correlation: z
      .object({
        status: z.enum(["OK", "INSUFFICIENT_HISTORY", "BLOCKED"]),
        pairs: z.array(
          z
            .object({
              tickerA: z.string(),
              tickerB: z.string(),
              correlation: Decimal,
            })
            .passthrough()
        ),
      })
      .partial()
      .passthrough()
      .nullish(),
    seriesQualification: z
      .object({
        seriesNature: z.string(),
        closeKind: z.string(),
        homologationStatus: z.enum([
          "HOMOLOGATED",
          "NOT_HOMOLOGATED",
          "TEST_FIXTURE",
        ]),
        usableForDecision: z.boolean(),
        eventsApplied: z.number().int(),
        note: z.string(),
      })
      .partial()
      .passthrough()
      .optional(),
    var95: z
      .object({
        status: z.enum(["BLOCKED", "OK", "INSUFFICIENT_HISTORY"]),
        reason: z.string(),
        method: z.string(),
        confidence: z.string(),
        unit: z.string(),
        disclaimer: z.string(),
        horizons: z.array(
          z
            .object({
              du: z.number().int(),
              varPercent: Decimal,
              limitations: z.array(z.string()),
            })
            .partial()
            .passthrough()
        ),
      })
      .partial()
      .passthrough()
      .optional(),
    markowitz: z
      .object({
        status: z.enum(["SEE_ENDPOINT", "INSUFFICIENT_HISTORY", "BLOCKED"]),
        endpoint: z.string(),
      })
      .partial()
      .passthrough()
      .optional(),
    assets: z
      .array(
        z
          .object({
            ticker: z.string(),
            assetClass: z.string().optional(),
            status: z.string(),
            returnCount: z.number().int().optional(),
            volatilityAnnualizedPercent: Decimal.optional(),
            maxDrawdownPercent: Decimal.optional(),
          })
          .passthrough()
      )
      .optional(),
    limitations: z.array(z.string()),
  })
  .passthrough();

const RiskPortfolioPoint = z
  .object({
    risk: Decimal,
    expectedReturn: Decimal,
    sharpe: Decimal.optional(),
    weights: z.record(Decimal),
  })
  .passthrough();

const PortfolioRiskResponse = z
  .object({
    status: z.enum(["OK", "INSUFFICIENT_HISTORY"]),
    limitations: z.array(z.string()).optional(),
    premises: z.array(z.string()).optional(),
    frontier: z
      .array(
        z
          .object({
            risk: Decimal,
            expectedReturn: Decimal,
            weights: z.record(Decimal).optional(),
          })
          .passthrough()
      )
      .optional(),
    minVariance: RiskPortfolioPoint.optional(),
    maxSharpe: RiskPortfolioPoint.optional(),
    betas: z
      .object({ ibov: Decimal, ifix: Decimal })
      .partial()
      .passthrough()
      .optional(),
    correlation: z
      .array(
        z
          .object({
            tickerA: z.string(),
            tickerB: z.string(),
            correlation: Decimal,
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

const OptionGreeks = z
  .object({
    delta: Decimal,
    gamma: Decimal,
    vega: Decimal,
    theta: Decimal,
    rho: Decimal,
  })
  .partial()
  .passthrough();

const OptionPayoff = z
  .object({
    strategy: z.enum(["COVERED_CALL", "CASH_SECURED_PUT"]),
    impliedReturn: Decimal,
    breakeven: Decimal,
    maxLoss: Decimal,
  })
  .partial()
  .passthrough();

const OptionPositionView = z
  .object({
    optionTicker: z.string(),
    underlying: z.string(),
    side: z.enum(["BUY", "SELL"]),
    optionType: z.enum(["CALL", "PUT"]),
    strike: Decimal.optional(),
    expiry: z.string().optional(),
    quantity: Decimal.optional(),
    premium: Decimal.optional(),
    status: z.enum(["OK", "INAPPLICABLE"]),
    theoreticalPrice: Decimal.optional(),
    impliedVolatility: Decimal.optional(),
    moneyness: z.enum(["ITM", "ATM", "OTM"]).optional(),
    greeks: OptionGreeks.optional(),
    payoff: OptionPayoff.optional(),
  })
  .passthrough();

const OptionPanelResponse = z
  .object({ positions: z.array(OptionPositionView) })
  .passthrough();

const TaxModalityLine = z
  .object({
    modality: z.enum([
      "SWING_EQUITY",
      "DAY_TRADE",
      "FII",
      "ETF",
      "DERIVATIVE_SWING",
      "DERIVATIVE_DAY",
    ]),
    soldTotal: Decimal,
    taxableGain: Decimal,
    lossOffset: Decimal,
    irRate: Decimal,
    irDue: Decimal,
    exemptUnder20k: z.boolean(),
  })
  .passthrough();

const DarfGuide = z
  .object({
    code: z.string(),
    amount: Decimal,
    yearMonth: z.string(),
    status: z.enum(["ISSUED", "CARRIED"]),
    dueDate: z.string().nullish(),
  })
  .passthrough();

const TaxApurationResponse = z
  .object({
    yearMonth: z.string(),
    modalities: z.array(TaxModalityLine),
    irrfCredit: Decimal,
    irDue: Decimal,
    darfCarryIn: Decimal.optional(),
    darf: DarfGuide,
    darfCarryOut: Decimal.optional(),
  })
  .passthrough();

const AdminAuditEntry = z
  .object({
    id: z.string(),
    tableName: z.string(),
    recordId: z.string().uuid(),
    actorUserId: z.string().uuid().nullish(),
    before: z.unknown().nullish(),
    after: z.unknown().nullish(),
    reason: z.string().nullish(),
    at: z.string().datetime({ offset: true }),
  })
  .passthrough();

const AdminOpsOverview = z
  .object({
    sourcesActive: z.number().int(),
    sourcesTotal: z.number().int(),
    featuresEnabled: z.number().int(),
    recentRuns: z.array(z.object({}).partial().passthrough()).optional(),
    recentAudit: z.array(AdminAuditEntry).optional(),
    productionCron: z.boolean(),
  })
  .passthrough();

const AdminCapabilityStatus = z
  .object({
    featureKey: z.string(),
    label: z.string(),
    enabled: z.boolean(),
    adapterImplemented: z.boolean(),
    accessConfigured: z.boolean(),
    testedWithFixture: z.boolean(),
    liveQueryVerified: z.boolean(),
    operationalHomologation: z.enum([
      "NOT_DECLARED",
      "PENDING",
      "HOMOLOGATED",
      "REJECTED",
    ]),
    commercialUseStatus: z.enum(["NOT_DECLARED", "BLOCKED", "ALLOWED"]),
    primarySlug: z.string().nullish(),
    fallbackSlug: z.string().nullish(),
    lastRunAt: z.string().datetime({ offset: true }).nullish(),
    lastRunStatus: z.string().nullish(),
    lastError: z.string().nullish(),
    coverageNote: z.string().optional(),
  })
  .passthrough();

const AdminDataSourceView = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    category: z.enum(["MARKET", "LLM", "GOVERNMENT"]),
    driver: z.string(),
    active: z.boolean(),
    isConfigured: z.boolean(),
    credentialHint: z.string().nullish(),
    baseUrl: z.string().nullish(),
    modelName: z.string().nullish(),
    timeoutMs: z.number().int().nullish(),
    rateLimitRpm: z.number().int().nullish(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();

const AdminDataSourceUpsert = z
  .object({
    slug: z.string(),
    name: z.string(),
    category: z.enum(["MARKET", "LLM", "GOVERNMENT"]),
    driver: z.string(),
    active: z.boolean().optional(),
    credential: z.string().optional(),
    baseUrl: z.string().optional(),
    modelName: z.string().optional(),
    timeoutMs: z.number().int().optional(),
    rateLimitRpm: z.number().int().optional(),
  })
  .passthrough();

const AdminConnectionTestResult = z
  .object({
    ok: z.boolean(),
    latencyMs: z.number().int(),
    message: z.string().optional(),
  })
  .passthrough();

const AdminFeatureRoutingView = z
  .object({
    featureKey: z.string(),
    label: z.string().optional(),
    isActive: z.boolean(),
    primarySourceId: z.string().uuid().nullish(),
    fallbackSourceId: z.string().uuid().nullish(),
    primarySlug: z.string().nullish(),
    fallbackSlug: z.string().nullish(),
  })
  .passthrough();

const AdminFeatureRoutingUpdate = z
  .object({
    featureKey: z.string(),
    isActive: z.boolean(),
    primarySourceId: z.string().uuid().nullish(),
    fallbackSourceId: z.string().uuid().nullish(),
  })
  .passthrough();

const SeriesIngestRunView = z
  .object({
    id: z.string().uuid(),
    capability: z.enum([
      "CDI",
      "IPCA",
      "SELIC",
      "TREASURY_PU",
      "ETTJ",
      "IPCA_PROJ",
      "LISTED_CLOSE",
    ]),
    status: z.enum(["RUNNING", "SUCCEEDED", "FAILED", "SKIPPED"]),
    startedAt: z.string().datetime({ offset: true }),
    finishedAt: z.string().datetime({ offset: true }).nullish(),
    observationsUpserted: z.number().int().optional(),
    observationsRevised: z.number().int().optional(),
    errorCode: z.string().nullish(),
    metrics: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();

const SeriesIngestTriggerRequest = z
  .object({
    capability: z.enum([
      "CDI",
      "IPCA",
      "SELIC",
      "TREASURY_PU",
      "ETTJ",
      "IPCA_PROJ",
      "LISTED_CLOSE",
    ]),
  })
  .passthrough();

const AdminUserView = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
    trialEndsAt: z.string().datetime({ offset: true }).nullish(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const AdminUserPatch = z
  .object({
    trialEndsAt: z.string().datetime({ offset: true }).nullable(),
    role: z.enum(["USER", "AUDITOR", "SUPPORT", "SUPER_ADMIN"]),
  })
  .partial()
  .passthrough();

const AdminSubscriptionView = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    userEmail: z.string().optional(),
    plan: z.string(),
    status: z.string(),
    currentPeriodEnd: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();

const AdminSubscriptionPatch = z
  .object({
    plan: z.enum(["CORE", "EXPERT"]),
    status: z.string(),
    currentPeriodEnd: z.string().datetime({ offset: true }).nullable(),
  })
  .partial()
  .passthrough();

const AdminObservabilitySnapshot = z
  .object({
    connectors: z.array(
      z
        .object({
          slug: z.string(),
          driver: z.string(),
          lastOk: z.boolean().nullish(),
          lastLatencyMs: z.number().int().nullish(),
          lastCheckedAt: z.string().datetime({ offset: true }).nullish(),
          successRate: z.number().nullish(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const schemas = {
  HealthResponse,
  ReadinessResponse,
  ErrorEnvelope,
  RegisterRequest,
  AuthTokens,
  LoginRequest,
  User,
  BillingCapability,
  BillingAddon,
  PaymentProviderStub,
  BillingStatus,
  Portfolio,
  PortfolioCreate,
  Decimal,
  WealthValuationComposition,
  PortfolioWealthSummary,
  PortfolioWealthPoint,
  AssetClass,
  AllocationByClass,
  AllocationBySector,
  AllocationByIndexer,
  AllocationMeta,
  PortfolioWealth,
  WealthScope,
  WealthCoverage,
  UserConsolidatedWealth,
  PortfolioReturnBenchmark,
  PortfolioReturnMonth,
  PortfolioReturns,
  TwrSeriesPoint,
  PortfolioReturnsLevel,
  PortfolioPerformanceChart,
  ScopedPortfolioReturns,
  PortfolioPositionSlice,
  ConsolidatedEnrichedPosition,
  ScopedPositionsResponse,
  reconcileScopedPortfolios_Body,
  ScopedReconcileResult,
  PortfolioTransferCreate,
  LedgerEventType,
  GrossAmountOrigin,
  Transaction,
  PortfolioTransferResult,
  TransactionCreate,
  TransactionUpdate,
  TransactionMove,
  Provenance,
  CustodianQuantity,
  Position,
  AssetCustodyBucket,
  createImportJob_Body,
  ImportPreviewRow,
  ImportColumnMapping,
  ImportJob,
  ImportColumnMappingRequest,
  FinancialInstitution,
  AssetSearchHit,
  EquityMetrics,
  FiiMetricsPanel,
  EtfMetrics,
  FiiHealthScore,
  AssetIncomeMetrics,
  AssetSheet,
  AssetCompareResponse,
  PriceClose,
  DividendCustodianShare,
  DividendView,
  DividendReceipt,
  YieldOnCost,
  DividendSeasonality,
  DividendProjection,
  EttjCurveKind,
  EttjNssView,
  TreasuryShock,
  TreasuryView,
  TreasurySpecies,
  TreasuryLotStatus,
  TreasuryEvaluationQuality,
  TreasuryEvaluationMeta,
  TreasuryLotEvent,
  TreasuryCouponReceipt,
  TreasuryCouponAgendaItem,
  TreasuryCouponAgenda,
  TreasuryAmortizationReceipt,
  TreasuryAmortizationAgendaItem,
  TreasuryAmortizationAgenda,
  TreasuryLot,
  TreasuryLotCreate,
  TreasuryLotRedeem,
  TreasuryLotSettle,
  TreasuryCouponReceiptCreate,
  TreasuryAmortizationReceiptCreate,
  FixedIncomeInstrumentType,
  FixedIncomeIndexType,
  FixedIncomeDayCount,
  FixedIncomeLiquidityType,
  FixedIncomeContractStatus,
  FixedIncomeSeriesCoverage,
  FixedIncomeConditionsReview,
  FixedIncomeEventType,
  FixedIncomeEvent,
  FixedIncomeContract,
  FixedIncomeContractCreate,
  FixedIncomeRedemptionCreate,
  FixedIncomeSettlementCreate,
  ValuationMethod,
  CeilingPriceRequest,
  CeilingPriceResponse,
  AlertTaxonomy,
  Alert,
  SuitabilityProfile,
  FeatureGate,
  ExportJob,
  exportScope_Body,
  DiagnoseRequest,
  DiagnosisOutput,
  DividendInconsistency,
  FixedIncomeRedemptionSimRequest,
  FixedIncomeRedemptionSimResponse,
  EquityGainsResponse,
  TreasuryPuPoint,
  TreasuryBondHistory,
  TreasuryHistoryResponse,
  TreasuryDurationView,
  AllocationSuggestionRequest,
  AllocationSuggestionResponse,
  WatchlistItem,
  MarketClosesIngestRequest,
  PrivacyEraseResponse,
  PortfolioRiskMetrics,
  RiskPortfolioPoint,
  PortfolioRiskResponse,
  OptionGreeks,
  OptionPayoff,
  OptionPositionView,
  OptionPanelResponse,
  TaxModalityLine,
  DarfGuide,
  TaxApurationResponse,
  AdminAuditEntry,
  AdminOpsOverview,
  AdminCapabilityStatus,
  AdminDataSourceView,
  AdminDataSourceUpsert,
  AdminConnectionTestResult,
  AdminFeatureRoutingView,
  AdminFeatureRoutingUpdate,
  SeriesIngestRunView,
  SeriesIngestTriggerRequest,
  AdminUserView,
  AdminUserPatch,
  AdminSubscriptionView,
  AdminSubscriptionPatch,
  AdminObservabilitySnapshot,
};
