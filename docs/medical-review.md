# 医学内容审校记录 / Medical content revision

日期：2026-11-15。覆盖三集全部 50 个段落的英文讲稿、中文译文及其对应标注语义。本记录是基于下列资料的内容修订，不表示已取得临床专家签审。

## 当前内容与历史草稿

`remotion/src/lesson-copy.json` 是旁白和双语字幕的编辑入口；`timeline*.json` 保留相同的英文全文和既有镜头时间。`scripts/generate-narration.py` 从短句合成音轨并生成实测时间戳。旧的 `ep*-script*.md` 是历史研究草稿，不应用来重新生成当前旁白。

## 修正项目

| 范围 | 原问题 | 当前表达与教学边界 | 依据 |
|---|---|---|---|
| 第 1 集：骨性结构 | 枕骨大孔被描述成将“枕骨连接到脊髓” | 延髓在大孔处与脊髓相续；枕骨参与后部及颅底 | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 1 集：小骨 | 泪骨与泪囊、下鼻甲与气流的关系过于简略 | 泪骨参与泪囊窝；温湿空气主要是覆盖黏膜的作用；犁骨为骨性鼻中隔后下部 | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 1 集：下颌骨 | “唯一会动的颅骨”缺乏 22 骨计数的语境 | 改为描述其通过颞下颌关节参与咀嚼与发音，避免与听小骨混淆 | [TMJ](https://www.ncbi.nlm.nih.gov/books/NBK271/) |
| 第 2 集：颅缝 | 把全部 22 骨都说成由缝锁定 | 明确“多数脑颅骨通过颅缝相接”，不包含下颌关节 | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 2 集：翼点与筛板 | “最薄”及“骨折必定导致嗅觉丧失”过于绝对 | 翼点为薄弱区域；出血、嗅觉障碍、脑脊液漏均用“可能” | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/)、[NICE NG232](https://www.nice.org.uk/guidance/ng232/chapter/Recommendations) |
| 第 2 集：视神经管 | “视觉离开颅”的方向错误 | 视神经将信号从视网膜传向脑；管内有视神经与眼动脉 | [Orbit](https://accessmedicine.mhmedical.com/content.aspx?bookid=3477&sectionid=286586976) |
| 第 2 集：内耳道 | 把面神经也描述成进入内耳后终止 | 面神经继续进入面神经管；前庭蜗神经分支联系内耳 | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 2 集：蝶骨三孔 | “排成一列”及模型标记易被当成精确孔位 | 去掉直线排列暗示；旁白和界面均说明示意定位，尤其卵圆孔、棘孔 | 模型表面网格检查；[Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 3 集：脑神经总表 | “学会就能读任何颅底影像”夸大 | 十处精选通道帮助组织解剖学习，应结合图谱与断层影像 | [Skull](https://www.ncbi.nlm.nih.gov/books/NBK499834/) |
| 第 3 集：破裂孔 | 易误解为颈内动脉纵贯破裂孔 | 颈内动脉经过软骨充填的破裂孔上方 | [Deep petrosal nerve](https://www.ncbi.nlm.nih.gov/books/NBK534817/) |
| 第 3 集：眼眶 | “只容纳眼球”错误 | 包括眼球、眼外肌、神经、血管、脂肪和泪器结构 | [Cunningham's Manual, The Orbit](https://accessmedicine.mhmedical.com/content.aspx?bookid=3477&sectionid=286586976) |
| 第 3 集：眶下裂 | 只提颧神经且穿行方向有误 | 上颌神经的眶下支和颧支及血管经此裂通过 | [Orbit bones](https://www.ncbi.nlm.nih.gov/books/NBK531490/) |
| 第 3 集：TMJ | 无依据的“全身使用最多的关节” | 改为关节盘、转动与滑动；模型不含软组织 | [TMJ examination](https://www.ncbi.nlm.nih.gov/books/NBK271/) |
| 第 3 集：颏神经 | “阻滞后整个下颌麻木”错误 | 颏神经阻滞影响下唇与颏部软组织，不麻醉牙齿；与下牙槽神经区分 | [Mental nerve block](https://www.ncbi.nlm.nih.gov/books/NBK482243/)、[Columbia dental teaching](https://www.columbia.edu/itc/hs/dental/d6401/2007/maxmandBW.pdf) |
| 第 3 集：Le Fort | 正面线遗漏翼突板，II 型路径过于简略 | 明确经典类型均累及翼突板，补充眶内侧等路径；标记为正面示意，实际可不对称或混合 | [Le Fort fractures](https://www.ncbi.nlm.nih.gov/books/NBK526060/) |
| 第 3 集：骨折体征 | 把瘀斑等同于确诊，固定出现时间 | 体征提示损伤，可能延迟，不能单独确诊；缺如不能排除骨折 | [Emergency medicine atlas](https://accessmedicine.mhmedical.com/content.aspx?bookid=2969&sectionid=250586669)、[NICE NG232](https://www.nice.org.uk/guidance/ng232/chapter/Recommendations) |
| 第 3 集：脑脊液漏 | 把伤后清液直接等同脑脊液 | 清液为可疑表现，需评估确认；经确认漏液提示硬脑膜缺损，持续漏液增加感染风险 | [Emergency medicine atlas](https://accessmedicine.mhmedical.com/content.aspx?bookid=2969&sectionid=250586669) |

## 其余段落核对

- 第 1 集其余段落：保留 8 块脑颅骨、14 块面颅骨计数；逐项核对各骨名称、成对关系、额骨/顶骨/颞骨/蝶骨/筛骨/上颌骨/颧骨/腭骨的位置与参与结构。总览、组合、结束段仅描述模型及基本功能。
- 第 2 集其余段落：核对冠状缝、矢状缝、人字缝、鳞状缝及前囟点/人字点；眶上裂的 III/IV/V1/VI、圆孔 V2、卵圆孔 V3、棘孔脑膜中动脉、颈静脉孔 IX/X/XI、舌下神经管 XII 和枕骨大孔的主要通过结构。
- 第 3 集其余段落：核对前/中/后神经通道、七块眶骨及四壁、茎乳孔与 VII、下颌前脱位的髁突位置；总结不再声称涵盖完整临床颅骨知识。

## 模型边界

BodyParts3D 表面网格提供骨性外形；本项目未测量或验证每个标记的三维坐标准确度。所有自定义孔位圆点均按“大致区域”呈现。不能把标注点当成经过标定的手术定位。鼻旁窦内部、神经血管、关节盘及软组织不在网格中。骨折与瘀斑为讲解叠加层。手机端数字与下方列表对应，中文和英文字幕来自同一条经过修订的短句。
