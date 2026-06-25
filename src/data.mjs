export const dimensions = [
  { key: "product", label: "产品适配度", weight: 1.1 },
  { key: "compliance", label: "合规准备度", weight: 1.15 },
  { key: "supply", label: "供应交付", weight: 1 },
  { key: "channel", label: "渠道能力", weight: 1 },
  { key: "organization", label: "组织能力", weight: 0.95 },
  { key: "finance", label: "资金与收款", weight: 0.9 },
  { key: "digital", label: "数字化能力", weight: 0.9 }
];

export const options = {
  provinces: [
    ["heilongjiang", "黑龙江"],
    ["jilin", "吉林"],
    ["liaoning", "辽宁"],
    ["innerMongolia", "内蒙古东部/满洲里通道"]
  ],
  industries: [
    ["agri-food", "农产品加工"],
    ["forest", "林下产品"],
    ["prepared-food", "预制/冷冻食品"],
    ["light-consumer", "轻工消费品"],
    ["equipment", "装备零部件"],
    ["chemical", "化工/材料"],
    ["other", "其他/待核验"]
  ],
  productCategories: [
    ["blackFungus", "黑木耳/林下产品"],
    ["grain", "杂粮/米面制品"],
    ["corn", "玉米深加工"],
    ["soy", "大豆制品"],
    ["honey", "蜂蜜/特色食品"],
    ["prepared", "预制/冷冻食品"],
    ["equipment", "装备零部件"],
    ["light", "轻工消费品"],
    ["unclear", "信息不足/高监管产品"]
  ],
  targetMarkets: [
    ["russia", "俄罗斯"],
    ["mongolia", "蒙古"],
    ["japan", "日本"],
    ["korea", "韩国"]
  ],
  exportExperience: [
    ["none", "无出口经验"],
    ["agent", "外贸公司/代理出口"],
    ["trial", "零星试单"],
    ["stable", "已有稳定出口"]
  ],
  teamSize: [
    ["none", "无外贸人员"],
    ["one", "兼职或 1 人"],
    ["small", "2-3 人团队"],
    ["mature", "成熟外贸团队"]
  ],
  budget: [
    ["tight", "预算紧张"],
    ["pilot", "可承担小额试点"],
    ["ready", "可承担认证/展会/推广"],
    ["strong", "可持续投入"]
  ]
};

export const uploadPolicy = {
  maxFiles: 10,
  maxFileSizeMb: 10,
  allowedExtensions: [".pdf", ".docx", ".xlsx", ".csv", ".txt"],
  blockedExtensions: [".exe", ".js", ".html", ".zip", ".rar", ".bat", ".ps1", ".docm", ".xlsm"],
  privacyNote: "MVP 不上传原始二进制文件到 AI，只提交前端提取的脱敏文本摘要和文件元数据。"
};

export const productProfiles = {
  blackFungus: {
    name: "黑木耳/林下产品",
    industry: "forest",
    baseFit: 4.4,
    complianceLoad: 2.6,
    supplyNeed: 3.2,
    typicalDocs: ["食品生产许可", "检测报告", "原产地证明", "俄文/英文标签", "批次追溯"],
    risks: ["干货类需关注防潮包装、批次追溯和标签语言。"]
  },
  grain: {
    name: "杂粮/米面制品",
    industry: "agri-food",
    baseFit: 4.1,
    complianceLoad: 2.8,
    supplyNeed: 3.4,
    typicalDocs: ["食品生产许可", "检测报告", "规格书", "稳定报价单", "原产地证明"],
    risks: ["农产品价格波动和成分/配料表需提前核验。"]
  },
  corn: {
    name: "玉米深加工",
    industry: "agri-food",
    baseFit: 4.2,
    complianceLoad: 3,
    supplyNeed: 3.7,
    typicalDocs: ["食品生产许可", "营养成分表", "检测报告", "报价单", "产能说明"],
    risks: ["需明确是原料、半成品还是终端食品，报价体系要稳定。"]
  },
  soy: {
    name: "大豆制品",
    industry: "agri-food",
    baseFit: 4,
    complianceLoad: 3.2,
    supplyNeed: 3.5,
    typicalDocs: ["食品安全体系", "过敏原标识", "俄文/英文标签", "检测报告"],
    risks: ["过敏原、转基因相关表述必须人工复核。"]
  },
  honey: {
    name: "蜂蜜/特色食品",
    industry: "agri-food",
    baseFit: 3.9,
    complianceLoad: 3.4,
    supplyNeed: 3.1,
    typicalDocs: ["检测报告", "原产地证明", "品牌资料", "包装规格", "溯源材料"],
    risks: ["蜂蜜类常涉及成分、残留和溯源要求，必须留有检测证明。"]
  },
  prepared: {
    name: "预制/冷冻食品",
    industry: "prepared-food",
    baseFit: 3.5,
    complianceLoad: 4.5,
    supplyNeed: 4.2,
    typicalDocs: ["HACCP/ISO22000", "冷链证明", "保质期验证", "配料表", "检测报告"],
    risks: ["冷链、配料、标签和准入要求较高，高风险项需人工复核。"]
  },
  equipment: {
    name: "装备零部件",
    industry: "equipment",
    baseFit: 3.8,
    complianceLoad: 3.5,
    supplyNeed: 3.8,
    typicalDocs: ["产品规格书", "质量体系证书", "技术图纸脱敏版", "报价单", "售后方案"],
    risks: ["技术参数、出口管制和售后责任需人工核验。"]
  },
  light: {
    name: "轻工消费品",
    industry: "light-consumer",
    baseFit: 3.7,
    complianceLoad: 3,
    supplyNeed: 3.2,
    typicalDocs: ["产品目录", "包装图", "质检报告", "报价单", "多语种素材"],
    risks: ["包装、品牌授权、平台规则和售后能力需核查。"]
  },
  unclear: {
    name: "信息不足/高监管产品",
    industry: "other",
    baseFit: 1.7,
    complianceLoad: 4.8,
    supplyNeed: 4,
    typicalDocs: ["产品成分", "HS 候选编码", "检测报告", "认证材料", "人工复核记录"],
    risks: ["信息不足时不能给确定性出海建议。"]
  }
};

export const marketRules = [
  {
    id: "russia",
    name: "俄罗斯",
    opportunity: 4.5,
    risk: 3.4,
    difficulty: 3.3,
    logistics: 4.2,
    fitProvinces: ["heilongjiang", "jilin", "innerMongolia"],
    fitProducts: ["blackFungus", "grain", "corn", "soy", "honey", "prepared", "equipment"],
    requirements: ["俄文标签", "收款与汇率风险复核", "产品准入材料", "合同条款人工审核"],
    note: "适合作为东北企业对俄试点市场，但收款、政策和标签风险需谨慎。"
  },
  {
    id: "mongolia",
    name: "蒙古",
    opportunity: 3.4,
    risk: 2.8,
    difficulty: 2.9,
    logistics: 3.8,
    fitProvinces: ["innerMongolia", "heilongjiang", "jilin"],
    fitProducts: ["grain", "corn", "light", "equipment"],
    requirements: ["小批量试点", "物流与季节风险复核", "渠道伙伴核验"],
    note: "市场容量有限，适合部分食品轻工和装备品类做小批量验证。"
  },
  {
    id: "japan",
    name: "日本",
    opportunity: 3.8,
    risk: 2.7,
    difficulty: 4.4,
    logistics: 3.7,
    fitProvinces: ["liaoning", "jilin"],
    fitProducts: ["honey", "prepared", "light", "soy"],
    requirements: ["高标准标签与检测", "稳定品牌资料", "日语素材", "准入人工复核"],
    note: "消费能力强但标准细、竞争强，适合已有质量体系和品牌资料的企业。"
  },
  {
    id: "korea",
    name: "韩国",
    opportunity: 3.7,
    risk: 2.8,
    difficulty: 4,
    logistics: 3.8,
    fitProvinces: ["liaoning", "jilin"],
    fitProducts: ["prepared", "honey", "light", "soy"],
    requirements: ["韩语包装素材", "食品标签复核", "渠道伙伴核验"],
    note: "适合辽宁、吉林部分特色食品和轻工品，但包装、口味和认证适配要求高。"
  }
];

export const ports = [
  {
    id: "suifenhe",
    name: "绥芬河口岸",
    provinceFit: ["heilongjiang"],
    productFit: ["blackFungus", "grain", "soy", "honey"],
    marketFit: ["russia"],
    transport: "陆路口岸",
    coldChain: "中",
    costLevel: "中",
    speedLevel: "中高",
    note: "适合黑龙江东部对俄陆路通道和特色农产品小批量试点。"
  },
  {
    id: "heihe",
    name: "黑河口岸",
    provinceFit: ["heilongjiang"],
    productFit: ["grain", "soy", "prepared", "blackFungus"],
    marketFit: ["russia"],
    transport: "陆路/边境通道",
    coldChain: "中",
    costLevel: "中",
    speedLevel: "中",
    note: "适合黑龙江北部对俄路径验证，需关注季节、报关和物流组织。"
  },
  {
    id: "hunchun",
    name: "珲春通道",
    provinceFit: ["jilin"],
    productFit: ["corn", "grain", "prepared", "soy", "equipment"],
    marketFit: ["russia", "korea", "japan"],
    transport: "陆海联运/东北亚通道",
    coldChain: "中",
    costLevel: "中",
    speedLevel: "中",
    note: "适合吉林企业讲东北亚通道叙事，支持俄日韩市场比较。"
  },
  {
    id: "manzhouli",
    name: "满洲里通道",
    provinceFit: ["innerMongolia", "heilongjiang"],
    productFit: ["grain", "corn", "honey", "equipment", "light"],
    marketFit: ["russia", "mongolia"],
    transport: "铁路/陆路通道",
    coldChain: "中",
    costLevel: "中",
    speedLevel: "中",
    note: "作为对俄/对蒙外延通道纳入比较，不表述为东北三省口岸。"
  },
  {
    id: "dalian",
    name: "大连港",
    provinceFit: ["liaoning", "jilin"],
    productFit: ["prepared", "honey", "light", "soy", "equipment"],
    marketFit: ["japan", "korea", "russia"],
    transport: "海运/港口",
    coldChain: "高",
    costLevel: "中高",
    speedLevel: "中高",
    note: "适合辽宁及吉林部分企业面向日韩、俄罗斯海运和冷链品类。"
  },
  {
    id: "yingkou",
    name: "营口港",
    provinceFit: ["liaoning", "jilin"],
    productFit: ["corn", "grain", "soy", "equipment"],
    marketFit: ["russia", "japan", "korea"],
    transport: "海运/港口",
    coldChain: "中",
    costLevel: "中",
    speedLevel: "中",
    note: "适合辽宁和吉林加工品出海，作为大连港备选路径比较。"
  }
];

export const servicePartners = [
  {
    id: "hlj-ccpit",
    orgName: "黑龙江贸促/国际商会服务窗口",
    orgType: "商协会/公共服务",
    province: "heilongjiang",
    city: "哈尔滨",
    serviceScope: ["商事证明", "国际展会", "企业出海咨询", "商协会资源"],
    targetMarkets: ["russia", "mongolia"],
    productCategories: ["blackFungus", "grain", "corn", "soy", "honey", "light"],
    ports: ["suifenhe", "heihe"],
    publicContact: "以官方网站公开联系方式为准",
    website: "https://www.ccpit.org/",
    sourceUrl: "https://www.ccpit.org/",
    sourceType: "official-reference",
    verifiedAt: "2026-06-25",
    permissionLevel: "public-org",
    trustLevel: "需赛前核验地方分支页面",
    notes: "适合作为园区/协会背书与企业访谈入口，不展示个人联系方式。"
  },
  {
    id: "ln-port-service",
    orgName: "辽宁港航外贸综合服务商样例",
    orgType: "外贸综合服务/货代",
    province: "liaoning",
    city: "大连",
    serviceScope: ["海运订舱", "日韩航线", "冷链物流", "报关协同"],
    targetMarkets: ["japan", "korea", "russia"],
    productCategories: ["prepared", "honey", "light", "equipment"],
    ports: ["dalian", "yingkou"],
    publicContact: "演示数据：需通过园区或官网公开渠道核验",
    website: "",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    permissionLevel: "demo-only",
    trustLevel: "不可直接作为真实联系方式使用",
    notes: "用于展示匹配逻辑，正式材料需替换为已授权入驻或公开核验服务商。"
  },
  {
    id: "jilin-ne-asia",
    orgName: "吉林东北亚通道外贸服务商样例",
    orgType: "外贸代理/多语种服务",
    province: "jilin",
    city: "延边/珲春",
    serviceScope: ["俄韩日语资料", "小批量试单", "外贸代理", "通道咨询"],
    targetMarkets: ["russia", "korea", "japan"],
    productCategories: ["corn", "grain", "soy", "prepared", "equipment"],
    ports: ["hunchun"],
    publicContact: "演示数据：需商协会或企业授权后展示",
    website: "",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    permissionLevel: "demo-only",
    trustLevel: "不可直接作为真实联系方式使用",
    notes: "适合吉林企业的多语种与东北亚通道服务展示。"
  },
  {
    id: "russian-labeling",
    orgName: "俄文标签与食品合规服务商样例",
    orgType: "认证检测/本地化",
    province: "heilongjiang",
    city: "哈尔滨/牡丹江",
    serviceScope: ["俄文标签", "食品检测材料整理", "配料表本地化", "人工复核"],
    targetMarkets: ["russia"],
    productCategories: ["blackFungus", "grain", "corn", "soy", "honey", "prepared"],
    ports: ["suifenhe", "heihe", "hunchun"],
    publicContact: "演示数据：正式上线前需授权入驻",
    website: "",
    sourceUrl: "team-research-needed",
    sourceType: "needs-verification",
    verifiedAt: "",
    permissionLevel: "demo-only",
    trustLevel: "待核验",
    notes: "用于命中“俄文标签能力不足”的服务推荐。"
  },
  {
    id: "customs-broker-demo",
    orgName: "对俄报关与商检协同服务商样例",
    orgType: "报关/商检协同",
    province: "heilongjiang",
    city: "绥芬河/黑河",
    serviceScope: ["报关资料清单", "商检协同", "口岸路径咨询", "试单支持"],
    targetMarkets: ["russia"],
    productCategories: ["blackFungus", "grain", "soy", "honey", "prepared", "light"],
    ports: ["suifenhe", "heihe"],
    publicContact: "演示数据：需公开渠道或合作授权核验",
    website: "",
    sourceUrl: "team-research-needed",
    sourceType: "needs-verification",
    verifiedAt: "",
    permissionLevel: "demo-only",
    trustLevel: "待核验",
    notes: "用于对俄口岸路径建议后的服务资源导航。"
  },
  {
    id: "cross-border-incubator",
    orgName: "东北跨境电商孵化服务机构样例",
    orgType: "跨境电商/运营辅导",
    province: "liaoning",
    city: "沈阳/大连",
    serviceScope: ["B2B 平台入驻", "产品页本地化", "询盘 SOP", "运营培训"],
    targetMarkets: ["japan", "korea", "russia"],
    productCategories: ["light", "honey", "prepared", "equipment"],
    ports: ["dalian", "yingkou"],
    publicContact: "演示数据：需机构授权或公开官网核验",
    website: "",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    permissionLevel: "demo-only",
    trustLevel: "不可直接作为真实联系方式使用",
    notes: "用于渠道能力不足但产品适配较好的企业。"
  }
];

export const samples = [
  {
    id: "hlj-fungus",
    name: "黑龙江木耳加工企业",
    companyName: "森谷林下食品加工厂（匿名样例）",
    province: "heilongjiang",
    city: "牡丹江",
    industry: "forest",
    productCategory: "blackFungus",
    productDescription: "干制黑木耳，国内商超供货为主，有稳定包装线，无直接出口经验。",
    annualCapacity: "稳定批量供应",
    certifications: ["食品生产许可", "冷链/保质期管理"],
    hasExportRight: false,
    exportExperience: "none",
    teamSize: "none",
    languageCapability: "无俄语/英语人员",
    targetMarket: "russia",
    budget: "pilot",
    channels: ["国内经销"],
    documents: []
  },
  {
    id: "jl-corn",
    name: "吉林玉米深加工企业",
    companyName: "吉粮玉米深加工有限公司（匿名样例）",
    province: "jilin",
    city: "长春",
    industry: "agri-food",
    productCategory: "corn",
    productDescription: "玉米粉、玉米胚芽粕和即食玉米制品，国内稳定销售，缺外贸团队。",
    annualCapacity: "规模化产能",
    certifications: ["食品生产许可", "HACCP/ISO22000"],
    hasExportRight: false,
    exportExperience: "none",
    teamSize: "none",
    languageCapability: "英语资料薄弱",
    targetMarket: "russia",
    budget: "ready",
    channels: ["国内经销"],
    documents: []
  },
  {
    id: "ln-honey",
    name: "辽宁特色食品已有出口经验",
    companyName: "辽海特色食品有限公司（匿名样例）",
    province: "liaoning",
    city: "大连",
    industry: "agri-food",
    productCategory: "honey",
    productDescription: "辽宁特色蜂蜜和小包装伴手礼食品，已有日韩零星订单，希望比较俄罗斯与日韩渠道。",
    annualCapacity: "稳定批量供应",
    certifications: ["食品生产许可", "HACCP/ISO22000", "俄文/英文标签", "冷链/保质期管理"],
    hasExportRight: true,
    exportExperience: "stable",
    teamSize: "small",
    languageCapability: "英语可沟通，日韩语依赖服务商",
    targetMarket: "japan",
    budget: "ready",
    channels: ["外贸公司", "B2B 平台"],
    documents: []
  },
  {
    id: "high-risk",
    name: "信息不足高监管产品",
    companyName: "北境营养食品工坊（匿名样例）",
    province: "heilongjiang",
    city: "哈尔滨",
    industry: "other",
    productCategory: "unclear",
    productDescription: "功能性营养食品，成分、HS 候选编码和目标市场认证资料尚不明确。",
    annualCapacity: "小批量试产",
    certifications: [],
    hasExportRight: false,
    exportExperience: "none",
    teamSize: "none",
    languageCapability: "无外语资料",
    targetMarket: "russia",
    budget: "tight",
    channels: ["国内私域销售"],
    documents: []
  }
];

export const sources = [
  {
    title: "World Bank WITS",
    url: "https://wits.worldbank.org/",
    purpose: "贸易、关税、非关税措施数据参考"
  },
  {
    title: "UN Comtrade Plus",
    url: "https://comtradeplus.un.org/",
    purpose: "国际贸易统计数据参考"
  },
  {
    title: "商务部国别指南",
    url: "https://fec.mofcom.gov.cn/article/gbdqzn/",
    purpose: "国别市场与经营风险规则来源"
  },
  {
    title: "生成式人工智能服务管理暂行办法",
    url: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
    purpose: "AI 输出边界与合规表述参考"
  },
  {
    title: "个人信息保护法",
    url: "https://flk.npc.gov.cn/detail2.html?ZmY4MDgxODE3YjY0NzJhMzAxN2I2NTZjYzIwNDAwNDQ%3D=",
    purpose: "联系人库与上传资料隐私边界参考"
  }
];

export const serviceTypes = [
  {
    id: "certification",
    label: "认证检测",
    description: "梳理食品生产许可、检测报告、HACCP/ISO、准入材料等。",
    investmentRange: "0.8-3 万元起，视品类和检测项目调整",
    contactPrep: ["营业执照", "食品生产许可或质量体系证书", "产品配料/规格", "近一年检测报告"]
  },
  {
    id: "labeling",
    label: "标签与本地化",
    description: "制作俄文/日文/韩文标签、产品页、包装说明和基础销售资料。",
    investmentRange: "0.3-1.2 万元",
    contactPrep: ["中文标签", "配料表", "保质期与贮存条件", "包装正反面照片"]
  },
  {
    id: "customs",
    label: "报关商检",
    description: "梳理报关资料、商检协同、原产地证、试单文件清单。",
    investmentRange: "按票或按服务包报价，试单阶段通常 0.2-1 万元",
    contactPrep: ["产品 HS 候选编码", "报价单", "装箱单样式", "合同或订单草稿"]
  },
  {
    id: "logistics",
    label: "货代物流",
    description: "比较口岸、港口、陆运、海运、冷链和样品寄送路径。",
    investmentRange: "样品/小批量 0.5-2 万元起，冷链另计",
    contactPrep: ["货物体积重量", "包装方式", "交货城市", "目标市场与期望时效"]
  },
  {
    id: "agency",
    label: "外贸代理",
    description: "为无外贸团队企业提供代理出口、跟单、收款和客户沟通支持。",
    investmentRange: "服务费、代理费或佣金制，需按合同人工复核",
    contactPrep: ["企业授权边界", "报价底线", "样品政策", "收款与开票要求"]
  },
  {
    id: "b2b",
    label: "B2B 平台运营",
    description: "搭建多语种产品页、询盘 SOP、平台入驻和基础运营。",
    investmentRange: "1-5 万元起，平台年费和广告费另计",
    contactPrep: ["产品图片", "英文/俄文卖点", "报价区间", "交付能力说明"]
  },
  {
    id: "finance",
    label: "收款与风控",
    description: "处理账期、汇率、信用保险、合同条款和跨境收款风险。",
    investmentRange: "以银行/信保/法务实际方案为准",
    contactPrep: ["拟交易金额", "账期要求", "目标客户信息", "合同模板"]
  },
  {
    id: "park",
    label: "园区与商协会",
    description: "连接公共服务窗口、展会、政策咨询、培训和服务商筛选。",
    investmentRange: "多为公共服务或低成本对接，展会另计",
    contactPrep: ["企业简介", "产品目录", "目标市场", "希望获得的服务清单"]
  }
];

export const enterpriseOptions = {
  provinces: [
    ["heilongjiang", "黑龙江"],
    ["jilin", "吉林"],
    ["liaoning", "辽宁"],
    ["innerMongolia", "内蒙古东部/满洲里通道"]
  ],
  companyTypes: [
    ["factory", "生产型企业"],
    ["trading", "贸易型企业"],
    ["integrated", "工贸一体企业"],
    ["park", "园区/孵化企业"],
    ["cooperative", "合作社/产地组织"]
  ],
  employeeScale: [
    ["micro", "20 人以下"],
    ["small", "20-100 人"],
    ["medium", "100-300 人"],
    ["large", "300 人以上"]
  ],
  revenueScale: [
    ["unknown", "暂不填写"],
    ["under5m", "500 万元以下"],
    ["5m-20m", "500-2000 万元"],
    ["20m-100m", "2000 万-1 亿元"],
    ["over100m", "1 亿元以上"]
  ],
  productCategories: [
    ["blackFungus", "黑木耳/林下产品"],
    ["grain", "杂粮/米面制品"],
    ["corn", "玉米深加工"],
    ["soy", "大豆制品"],
    ["honey", "蜂蜜/特色食品"],
    ["prepared", "预制/冷冻食品"],
    ["light", "轻工消费品"],
    ["equipment", "装备零部件"],
    ["highRegulation", "功能食品/高监管或信息不足产品"]
  ],
  packageStatus: [
    ["none", "仅国内包装"],
    ["editable", "包装可调整"],
    ["bilingual", "已有双语包装/标签"],
    ["marketReady", "已有目标市场包装方案"]
  ],
  targetMarkets: [
    ["russia", "俄罗斯"],
    ["mongolia", "蒙古"],
    ["japan", "日本"],
    ["korea", "韩国"]
  ],
  exportExperience: [
    ["none", "无出口经验"],
    ["agent", "通过外贸公司/代理出口"],
    ["trial", "有样品或零星试单"],
    ["stable", "已有稳定出口"]
  ],
  teamSize: [
    ["none", "无外贸人员"],
    ["one", "兼职或 1 人"],
    ["small", "2-3 人小团队"],
    ["mature", "成熟外贸团队"]
  ],
  budget: [
    ["tight", "1 万元以内，只能低成本试水"],
    ["pilot", "1-5 万元，可做小额试点"],
    ["ready", "5-20 万元，可投入认证/展会/平台"],
    ["strong", "20 万元以上，可持续投入"]
  ],
  timelinePreference: [
    ["fast", "30 天内看到可执行路径"],
    ["normal", "90 天内形成试单准备"],
    ["steady", "3-6 个月系统建设"]
  ],
  riskTolerance: [
    ["low", "低风险，先补资料再试单"],
    ["medium", "可接受小批量试错"],
    ["high", "愿意快速推进并承担试点风险"]
  ],
  quoteBasis: [
    ["unknown", "暂不清楚"],
    ["exw", "EXW 工厂交货"],
    ["fob", "FOB"],
    ["cif", "CIF"],
    ["ddp", "DDP/包税到门需人工复核"]
  ],
  documentTypes: [
    ["license", "营业执照/主体资质"],
    ["catalog", "产品手册/图片"],
    ["certificate", "认证证书/检测报告"],
    ["label", "包装标签"],
    ["quotation", "报价单"],
    ["contract", "历史订单/合同"],
    ["other", "其他资料"]
  ]
};

export const tobProductProfiles = {
  blackFungus: {
    name: "黑木耳/林下产品",
    industry: "forest",
    riskBand: "A",
    baseFit: 4.4,
    complianceLoad: 2.8,
    supplyNeed: 3.1,
    typicalDocs: ["食品生产许可", "检测报告", "原产地证明", "俄文/英文标签", "批次追溯记录"],
    defaultNeeds: ["certification", "labeling", "customs", "logistics", "park"],
    risks: ["干货类需关注防潮包装、批次追溯、标签语言和农残/微生物检测。"]
  },
  grain: {
    name: "杂粮/米面制品",
    industry: "agri-food",
    riskBand: "A",
    baseFit: 4.1,
    complianceLoad: 3,
    supplyNeed: 3.4,
    typicalDocs: ["食品生产许可", "检测报告", "规格书", "稳定报价单", "原产地证明"],
    defaultNeeds: ["certification", "labeling", "customs", "logistics", "agency"],
    risks: ["农产品价格波动、配料表、过敏原和目标市场标签要求需要提前核验。"]
  },
  corn: {
    name: "玉米深加工",
    industry: "agri-food",
    riskBand: "B",
    baseFit: 4.2,
    complianceLoad: 3.2,
    supplyNeed: 3.7,
    typicalDocs: ["食品生产许可", "营养成分表", "检测报告", "报价单", "产能说明"],
    defaultNeeds: ["certification", "customs", "logistics", "agency", "finance"],
    risks: ["需要明确原料、半成品还是终端食品，报价体系和供货周期要稳定。"]
  },
  soy: {
    name: "大豆制品",
    industry: "agri-food",
    riskBand: "B",
    baseFit: 4,
    complianceLoad: 3.3,
    supplyNeed: 3.5,
    typicalDocs: ["食品安全体系", "过敏原标识", "俄文/英文标签", "检测报告", "配料表"],
    defaultNeeds: ["certification", "labeling", "customs", "agency"],
    risks: ["过敏原、非转基因表述和配料合规必须人工复核。"]
  },
  honey: {
    name: "蜂蜜/特色食品",
    industry: "agri-food",
    riskBand: "B",
    baseFit: 3.9,
    complianceLoad: 3.5,
    supplyNeed: 3.1,
    typicalDocs: ["检测报告", "原产地证明", "品牌资料", "包装规格", "溯源材料"],
    defaultNeeds: ["certification", "labeling", "b2b", "logistics", "finance"],
    risks: ["蜂蜜常涉及成分、残留、溯源和品牌背书，需保留检测证明。"]
  },
  prepared: {
    name: "预制/冷冻食品",
    industry: "prepared-food",
    riskBand: "C",
    baseFit: 3.5,
    complianceLoad: 4.5,
    supplyNeed: 4.3,
    typicalDocs: ["HACCP/ISO22000", "冷链证明", "保质期验证", "配料表", "检测报告"],
    defaultNeeds: ["certification", "labeling", "logistics", "customs", "finance"],
    risks: ["冷链、配方、标签、保质期和准入要求较高，必须人工复核。"]
  },
  light: {
    name: "轻工消费品",
    industry: "light-consumer",
    riskBand: "D",
    baseFit: 3.7,
    complianceLoad: 3,
    supplyNeed: 3.2,
    typicalDocs: ["产品目录", "包装图", "质检报告", "报价单", "多语种素材"],
    defaultNeeds: ["b2b", "labeling", "logistics", "agency"],
    risks: ["包装、品牌授权、平台规则和售后能力需要核查。"]
  },
  equipment: {
    name: "装备零部件",
    industry: "equipment",
    riskBand: "E",
    baseFit: 3.8,
    complianceLoad: 3.5,
    supplyNeed: 3.8,
    typicalDocs: ["产品规格书", "质量体系证书", "技术图纸脱敏版", "报价单", "售后方案"],
    defaultNeeds: ["b2b", "customs", "logistics", "finance"],
    risks: ["技术参数、出口管制、售后责任和知识产权需要人工核验。"]
  },
  highRegulation: {
    name: "功能食品/高监管或信息不足产品",
    industry: "other",
    riskBand: "X",
    baseFit: 1.8,
    complianceLoad: 4.9,
    supplyNeed: 4,
    typicalDocs: ["产品成分", "HS 候选编码", "检测报告", "认证材料", "人工复核记录"],
    defaultNeeds: ["certification", "finance", "park"],
    risks: ["信息不足时不能给确定性出海建议，必须先由专业机构复核准入和合规边界。"]
  }
};

export const tobServicePartners = [
  {
    id: "hlj-ccpit",
    orgName: "黑龙江贸促/国际商会公共服务窗口",
    orgType: "商协会/公共服务",
    province: "heilongjiang",
    city: "哈尔滨",
    businessScope: "商事证明、国际展会、企业出海咨询、商协会资源对接。",
    serviceTypes: ["park", "finance", "agency"],
    targetMarkets: ["russia", "mongolia"],
    productCategories: ["blackFungus", "grain", "corn", "soy", "honey", "light"],
    suitableStages: ["零基础试水型", "产品成熟缺渠道型", "口岸小批量试单型"],
    ports: ["suifenhe", "heihe"],
    investmentLevel: "低到中",
    timeToStart: "1-2 周内可先做公共咨询或活动报名",
    publicContact: "以官方网站公开联系方式为准",
    sourceUrl: "https://www.ccpit.org/",
    sourceType: "official-reference",
    verifiedAt: "2026-06-25",
    trustLevel: "公开机构入口，地方页面需赛前二次核验",
    contactPrep: ["企业简介", "产品目录", "目标市场", "希望对接的服务类型"]
  },
  {
    id: "suifenhe-crossborder-park",
    orgName: "绥芬河对俄通道园区服务样例",
    orgType: "园区/口岸服务",
    province: "heilongjiang",
    city: "绥芬河",
    businessScope: "对俄口岸政策咨询、试单路径、报关商检服务商筛选、仓配资源对接。",
    serviceTypes: ["park", "customs", "logistics", "agency"],
    targetMarkets: ["russia"],
    productCategories: ["blackFungus", "grain", "soy", "honey", "light"],
    suitableStages: ["零基础试水型", "合规补证优先型", "口岸小批量试单型"],
    ports: ["suifenhe"],
    investmentLevel: "低到中",
    timeToStart: "2-3 周形成试单资料清单",
    publicContact: "演示数据：需通过园区或政府公开渠道核验",
    sourceUrl: "team-research-needed",
    sourceType: "needs-verification",
    verifiedAt: "",
    trustLevel: "待核验，不可直接作为真实联系方式使用",
    contactPrep: ["产品名称", "预计货量", "目标城市", "营业执照和产品资质摘要"]
  },
  {
    id: "ru-label-food",
    orgName: "俄文标签与食品合规服务商样例",
    orgType: "认证检测/本地化",
    province: "heilongjiang",
    city: "哈尔滨/牡丹江",
    businessScope: "俄文标签、配料表本地化、食品检测资料整理、人工合规复核。",
    serviceTypes: ["certification", "labeling"],
    targetMarkets: ["russia"],
    productCategories: ["blackFungus", "grain", "corn", "soy", "honey", "prepared"],
    suitableStages: ["合规补证优先型", "口岸小批量试单型", "高风险资料不足型"],
    ports: ["suifenhe", "heihe", "hunchun"],
    investmentLevel: "中",
    timeToStart: "1-4 周，取决于检测项目",
    publicContact: "演示数据：正式上线前需授权入驻或官网核验",
    sourceUrl: "team-research-needed",
    sourceType: "needs-verification",
    verifiedAt: "",
    trustLevel: "待核验",
    contactPrep: ["中文标签", "配料表", "检测报告", "包装照片", "目标市场"]
  },
  {
    id: "jl-neasia-service",
    orgName: "吉林东北亚通道外贸服务商样例",
    orgType: "外贸代理/多语种服务",
    province: "jilin",
    city: "延边/珲春",
    businessScope: "俄日韩资料本地化、小批量试单、外贸代理、通道咨询。",
    serviceTypes: ["agency", "labeling", "logistics", "park"],
    targetMarkets: ["russia", "korea", "japan"],
    productCategories: ["corn", "grain", "soy", "prepared", "equipment"],
    suitableStages: ["零基础试水型", "产品成熟缺渠道型", "口岸小批量试单型"],
    ports: ["hunchun"],
    investmentLevel: "中",
    timeToStart: "2-4 周建立代理沟通和样品方案",
    publicContact: "演示数据：需商协会或企业授权后展示",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    trustLevel: "不可直接作为真实联系方式使用",
    contactPrep: ["产品规格", "报价底线", "样品政策", "可接受代理边界"]
  },
  {
    id: "jl-corn-industrial",
    orgName: "吉林玉米深加工外贸综合服务样例",
    orgType: "行业外贸服务/代理",
    province: "jilin",
    city: "长春/松原",
    businessScope: "玉米深加工产品报价体系、代理出口、B2B 产品页、样品试单组织。",
    serviceTypes: ["agency", "b2b", "customs", "finance"],
    targetMarkets: ["russia", "mongolia", "korea"],
    productCategories: ["corn", "grain"],
    suitableStages: ["产品成熟缺渠道型", "零基础试水型", "已有出口优化型"],
    ports: ["hunchun", "dalian", "yingkou"],
    investmentLevel: "中",
    timeToStart: "2-6 周形成报价和试单 SOP",
    publicContact: "演示数据：需替换为授权服务商或公开来源",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    trustLevel: "不可直接作为真实联系方式使用",
    contactPrep: ["产品参数", "产能说明", "报价单", "付款条款偏好"]
  },
  {
    id: "ln-port-logistics",
    orgName: "辽宁港航外贸综合服务商样例",
    orgType: "外贸综合服务/货代",
    province: "liaoning",
    city: "大连",
    businessScope: "海运订舱、日韩航线、冷链物流、报关协同。",
    serviceTypes: ["logistics", "customs", "agency"],
    targetMarkets: ["japan", "korea", "russia"],
    productCategories: ["prepared", "honey", "light", "equipment", "soy"],
    suitableStages: ["已有出口优化型", "日韩高标准准备型", "产品成熟缺渠道型"],
    ports: ["dalian", "yingkou"],
    investmentLevel: "中到高",
    timeToStart: "1-3 周可获得路线和报价区间",
    publicContact: "演示数据：需通过园区或官网公开渠道核验",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    trustLevel: "不可直接作为真实联系方式使用",
    contactPrep: ["体积重量", "冷链要求", "交货港口", "目标国家", "预计批量"]
  },
  {
    id: "ln-crossborder-incubator",
    orgName: "东北跨境电商孵化服务机构样例",
    orgType: "B2B 平台/运营辅导",
    province: "liaoning",
    city: "沈阳/大连",
    businessScope: "B2B 平台入驻、产品页本地化、询盘 SOP、运营培训。",
    serviceTypes: ["b2b", "labeling", "agency"],
    targetMarkets: ["japan", "korea", "russia"],
    productCategories: ["light", "honey", "prepared", "equipment"],
    suitableStages: ["产品成熟缺渠道型", "已有出口优化型"],
    ports: ["dalian", "yingkou"],
    investmentLevel: "中",
    timeToStart: "2-4 周形成产品页和询盘流程",
    publicContact: "演示数据：需机构授权或公开官网核验",
    sourceUrl: "team-research-needed",
    sourceType: "partner-demo",
    verifiedAt: "",
    trustLevel: "不可直接作为真实联系方式使用",
    contactPrep: ["产品图片", "卖点", "报价区间", "目标客户类型"]
  },
  {
    id: "manual-compliance-review",
    orgName: "高风险品类人工合规复核入口",
    orgType: "人工复核/专家服务",
    province: "heilongjiang",
    city: "线上/公共服务入口",
    businessScope: "高监管食品、功能性产品、HS 候选编码、准入和合同风险的人工复核。",
    serviceTypes: ["certification", "finance", "park"],
    targetMarkets: ["russia", "mongolia", "japan", "korea"],
    productCategories: ["highRegulation", "prepared", "equipment"],
    suitableStages: ["高风险资料不足型", "合规补证优先型"],
    ports: ["suifenhe", "heihe", "hunchun", "dalian", "yingkou", "manzhouli"],
    investmentLevel: "待评估",
    timeToStart: "需先补齐资料再报价",
    publicContact: "不展示具体个人联系方式，需通过团队人工核验后推荐",
    sourceUrl: "team-research-needed",
    sourceType: "needs-verification",
    verifiedAt: "",
    trustLevel: "高风险占位入口，必须人工确认",
    contactPrep: ["完整成分", "检测报告", "目标国家", "历史销售资料", "拟定 HS 候选编码"]
  }
];

export const tobSamples = [
  {
    id: "hlj-fungus-basic",
    name: "黑龙江木耳企业：无出口经验",
    company: {
      name: "森谷林下食品加工厂（匿名样例）",
      province: "heilongjiang",
      city: "牡丹江",
      companyType: "factory",
      businessScope: "黑木耳、山野菜等林下产品加工、包装和国内销售。",
      mainBusiness: "国内商超和批发渠道供货",
      employeeScale: "small",
      annualRevenue: "5m-20m"
    },
    product: {
      name: "干制黑木耳",
      category: "blackFungus",
      description: "干制黑木耳，国内商超供货为主，有稳定包装线，无直接出口经验。",
      specs: "袋装 100g/250g，可按客户要求调整包装。",
      annualCapacity: "稳定批量供应",
      shelfLife: "12 个月",
      coldChain: false,
      packageStatus: "editable",
      certifications: ["食品生产许可"]
    },
    trade: {
      hasExportRight: false,
      exportExperience: "none",
      teamSize: "none",
      languageCapability: "无俄语/英语人员",
      channels: ["国内经销"],
      targetMarket: "russia",
      quoteBasis: "unknown",
      paymentReadiness: "未建立跨境收款方案"
    },
    constraints: {
      budget: "pilot",
      timelinePreference: "normal",
      riskTolerance: "low",
      staffAvailable: "老板和内勤兼职跟进",
      acceptsAgent: true,
      bottlenecks: ["不知道需要哪些认证", "没有俄文标签", "没有口岸服务商"]
    },
    documents: []
  },
  {
    id: "jl-corn-no-team",
    name: "吉林玉米深加工：产品成熟缺团队",
    company: {
      name: "吉粮玉米深加工有限公司（匿名样例）",
      province: "jilin",
      city: "长春",
      companyType: "factory",
      businessScope: "玉米粉、玉米胚芽粕、即食玉米制品加工销售。",
      mainBusiness: "国内稳定经销和食品厂供货",
      employeeScale: "medium",
      annualRevenue: "20m-100m"
    },
    product: {
      name: "玉米粉及即食玉米制品",
      category: "corn",
      description: "规模化产能，国内销售稳定，希望先做俄罗斯或蒙古小批量试单。",
      specs: "25kg 工业包装与小包装均可生产。",
      annualCapacity: "规模化产能",
      shelfLife: "9-12 个月",
      coldChain: false,
      packageStatus: "editable",
      certifications: ["食品生产许可", "HACCP/ISO22000"]
    },
    trade: {
      hasExportRight: false,
      exportExperience: "none",
      teamSize: "none",
      languageCapability: "英文资料薄弱",
      channels: ["国内经销"],
      targetMarket: "russia",
      quoteBasis: "exw",
      paymentReadiness: "可接受代理收款和合同复核"
    },
    constraints: {
      budget: "ready",
      timelinePreference: "normal",
      riskTolerance: "medium",
      staffAvailable: "可指定 1 名销售对接服务商",
      acceptsAgent: true,
      bottlenecks: ["没有外贸团队", "不知道报价和物流怎么拆"]
    },
    documents: []
  },
  {
    id: "ln-honey-exporter",
    name: "辽宁特色食品：已有出口经验",
    company: {
      name: "辽海特色食品有限公司（匿名样例）",
      province: "liaoning",
      city: "大连",
      companyType: "integrated",
      businessScope: "蜂蜜、伴手礼食品、小包装特色食品生产与出口。",
      mainBusiness: "国内零售及日韩零星订单",
      employeeScale: "small",
      annualRevenue: "20m-100m"
    },
    product: {
      name: "小包装蜂蜜与伴手礼食品",
      category: "honey",
      description: "已有日韩零星订单，希望比较俄罗斯与日韩渠道，优化外贸资料和服务商组合。",
      specs: "小包装零售装，可做礼盒。",
      annualCapacity: "稳定批量供应",
      shelfLife: "18 个月",
      coldChain: false,
      packageStatus: "bilingual",
      certifications: ["食品生产许可", "HACCP/ISO22000", "俄文/英文标签"]
    },
    trade: {
      hasExportRight: true,
      exportExperience: "stable",
      teamSize: "small",
      languageCapability: "英语可沟通，日韩语依赖服务商",
      channels: ["外贸公司", "B2B 平台"],
      targetMarket: "japan",
      quoteBasis: "fob",
      paymentReadiness: "已有跨境收款经验"
    },
    constraints: {
      budget: "ready",
      timelinePreference: "steady",
      riskTolerance: "medium",
      staffAvailable: "2 人跟进外贸资料和询盘",
      acceptsAgent: false,
      bottlenecks: ["需要优化平台询盘", "需要比较不同市场风险"]
    },
    documents: []
  },
  {
    id: "high-risk-functional",
    name: "高监管功能食品：资料不足",
    company: {
      name: "北境营养食品工坊（匿名样例）",
      province: "heilongjiang",
      city: "哈尔滨",
      companyType: "factory",
      businessScope: "营养食品、功能性食品研发和销售。",
      mainBusiness: "国内私域销售",
      employeeScale: "micro",
      annualRevenue: "under5m"
    },
    product: {
      name: "功能性营养食品",
      category: "highRegulation",
      description: "成分、HS 候选编码和目标市场认证资料尚不明确。",
      specs: "暂未整理完整配料和功效表述。",
      annualCapacity: "小批量试产",
      shelfLife: "待验证",
      coldChain: false,
      packageStatus: "none",
      certifications: []
    },
    trade: {
      hasExportRight: false,
      exportExperience: "none",
      teamSize: "none",
      languageCapability: "无外语资料",
      channels: ["国内私域销售"],
      targetMarket: "russia",
      quoteBasis: "unknown",
      paymentReadiness: "未准备"
    },
    constraints: {
      budget: "tight",
      timelinePreference: "fast",
      riskTolerance: "low",
      staffAvailable: "无专职人员",
      acceptsAgent: true,
      bottlenecks: ["产品成分和合规不清楚", "资料严重不足"]
    },
    documents: []
  }
];
