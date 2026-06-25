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
