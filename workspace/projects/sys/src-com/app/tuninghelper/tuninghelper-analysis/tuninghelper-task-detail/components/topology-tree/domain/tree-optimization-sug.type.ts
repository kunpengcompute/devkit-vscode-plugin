/** 阈值项 */
type Threshold = {
  id: number;
  expected_value: number;
  indicator: string;
  indicator_cn: string;
  indicator_en: string;
  desc_cn?: string;
  desc_en?: string;
  // 实际采集值
  value: string
};

/** 表单项 采集值、阈值描述 */
type IndicatorDetail = {
  // 指标说明
  desc_cn?: string;
  desc_en?: string;
  // 指标key值
  indicator_cn: string;
  indicator_en: string;
  // 指标值
  value: string;
  [propName: string]: any;
};

/** 表格列 指标描述 */
type IndicatorDesc = {
  // 指标项
  indicator: string;
  indicator_cn: string;
  indicator_en: string;
  // 指标说明
  desc_cn?: string;
  desc_en?: string;
  children?: Array<IndicatorDesc>;
};

/** 多表格情况 */
type MultiTableData = {
  // 表格数据
  data_list: Array<any>;
  // 指标描述
  desc: Array<IndicatorDesc>;
  // 表格标题
  title_cn?: string;
  title_en?: string;
  table_name?: string;
};

/** cpu指标 */
type CpuIndicator = {
  // 表格数据
  data_list?: Array<any>;
  // 指标描述
  desc?: Array<IndicatorDesc>;
  // 表单显示数据
  form_list?: Array<IndicatorDetail>;
  // 多表格情况
  multi_data_list?: Array<MultiTableData>;
};

export {
  Threshold,
  IndicatorDetail,
  IndicatorDesc,
  MultiTableData,
  CpuIndicator,
};


