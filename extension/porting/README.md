# 鲲鹏代码迁移插件

自动扫描并分析用户待迁移软件，提供专业迁移指导。

- 一键式部署

  支持从Visual Studio Marketplace下载并在线安装插件，同时支持一键部署服务端环境。

- 分析扫描

  自动扫描并分析软件包、源码文件，提供可迁移性评估报告。

- 代码迁移

  对软件源码进行跨平台兼容性分析，识别出需迁移的代码，并给出迁移指导，同时提供软件包重构、部分专项软件迁移等能力。

## 版本配套关系

该插件需配套后台服务运行，后台服务需安装在基于鲲鹏的服务器上。两者的配套关系如下：
<table cellpadding="0" cellspacing="0" style="border:1px solid gray; border-bottom: none; border-right: none;">
        <tr>
            <th style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">插件版本</th>
            <th style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">后台版本</th>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.3</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.0</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.2</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.T20</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.1</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.T10</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.8</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T4</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.7</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T4</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.6</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.1</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.5</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T3</td>
        </tr>
  </table>

后台版本获取方式：

1. 通过插件的“一键式部署”功能自动安装
2. 前往<a href="https://www.hikunpeng.com/developer/devkit/porting-advisor?data=web">鲲鹏社区</a>获取后台服务安装包及安装方式

## 功能简介

作为客户端调用服务端的功能，完成扫描迁移任务，可以对待迁移软件进行快速扫描分析，并提供专业的代码迁移指导，极大简化客户应用迁移到鲲鹏平台的过程。当客户有软件需要迁移到鲲鹏平台上时，可先用该工具分析可迁移性和迁移投入，以解决客户软件迁移评估中分析投入大、准确率低、整体效率低下的痛点。

代码迁移工具支持的功能特性如下：

- 软件迁移评估

  自动扫描并分析软件包（非源码包）、已安装的软件，提供可迁移性评估报告。

- 源码迁移

  能够自动检查并分析出用户源码、C/C++软件构建工程文件、C/C++软件构建工程文件使用的链接库、x86汇编代码中需要修改的内容，并给出修改指导，以解决用户代码兼容性排查困难、迁移经验欠缺、反复依赖编译调错定位等痛点。

- 软件包重构

  通过分析x86平台软件包（RPM格式、DEB格式）的软件构成关系及硬件依赖性，重构适用于鲲鹏平台的软件包。

- 专项软件迁移

  基于鲲鹏解决方案的软件迁移模板，进行自动化迁移修改、编译、构建软件包，帮助用户快速迁移软件。

- 增强功能

  支持软件代码质量的静态检查功能，如在64位环境中运行的兼容性检查、结构体字节对齐检查和弱内存序检查等增强功能。

工具主要功能操作动图指导：

- 一键式部署配置

  ![一键式部署配置](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/zh-one_click_deployment.gif)

- 软件迁移评估

  ![软件迁移评估](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/zh-software_porting_assessment.gif)

- 源码迁移

  ![源码迁移](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/zh-source_code_porting.gif)

- 软件包重构

  ![软件包重构](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/zh-software_rebuilding.gif)

- 专项软件迁移

  ![专项软件迁移](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/zh-dedicated_software_porting.gif)

## 免责声明

1. 本插件服务对象为企业用户，使用者为企业用户有工作需要的员工。您在遵守国家法律、法规、政策的前提下，可出于工作目的使用本插件。
2. 未经所有者授权，任何个人或组织均不得私自传播该插件。您不得删除本插件中的版权声明及其它信息，不得对本插件进行反向工程、反向汇编、反向编译等。
3. 除非法律法规或双方合同另有规定，本插件以“现状”提供且不带有任何明示或暗示保证，包括但不限于针对某一特定用途的适用性及不侵权的保证。
4. 本插件为测试版本，仅用于开发测试环境和公测。您使用本插件过程中得到的反馈仅供参考，不以任何方式或形式构成特定指引和建议。
5. 您使用本插件过程中所采取的任何行为均由您自行承担风险，华为公司在任何情况下均不对任何性质的损害或损失负责。
6. 如您使用本插件过程中违反前述免责声明，华为公司不对由此造成的一切后果负责，亦不承担任何法律责任。必要时，还将追究责任方的法律责任。

# Kunpeng Porting Advisor Plugin

The Kunpeng Porting Advisor Plugin automatically scans and analyzes the software to be ported and provides professional porting guidance.

- One-click deployment

  You can download the plugin from the JetBrains Marketplace and install it online, and deploy the server environment by simply clicking the mouse.

- Analysis and scanning

  The plugin scans and analyzes software packages and source code files, and provides porting feasibility reports.

- Code porting

  The plugin analyzes the cross-platform compatibility of software source code, identifies the code to be ported, and provides porting guidance.

## Version Mapping

This plug-in needs to run with the background service, which must be installed on Kunpeng-powered servers. The version mapping is as follows:

<table cellpadding="0" cellspacing="0" style="border:1px solid gray; border-bottom: none; border-right: none;">
        <tr>
            <th style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">Plug-in Version</th>
            <th style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">Background Version</th>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.3</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.0</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.2</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.T20</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.1</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.3.T10</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.8</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T4</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.7</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T4</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.6</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.1</td>
        </tr>
        <tr>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.5</td>
            <td style="height:32px; border: 1px solid gray; border-top: none; border-left: none;padding: 8px;">2.2.T3</td>
        </tr>
  </table>

You can use either of the following method to obtain the background version:

1. Use the one-click deployment function of the plug-in to automatically install it.
2. Go to the <a href="https://www.hikunpeng.com/developer/devkit/porting-advisor?data=web">Kunpeng Community</a> to obtain the background service installation package and installation method.

## Introduction to the Kunpeng Porting Advisor

The Kunpeng Porting Advisor functions as a client to call the functions of the server to complete scanning and porting tasks. It quickly scans and analyzes the software to be ported and provides professional code porting guidance, greatly simplifying the process of porting applications to the Kunpeng platform. This tool addresses the problems of heavy workload, low accuracy, and poor overall efficiency in manual analysis.

The Kunpeng Porting Advisor provides the following functions:

- Software porting assessment

  Scans and analyzes software packages (not source code packages) and installed software, and provides porting assessment reports.

- Source code porting

  The Kunpeng Porting Advisor can automatically check and analyze users' source code, C/C++ software build project files, link libraries used by C/C++ software build project files, and content that needs to be modified in x86 assembly code. It provides automatic code compatibility check, removes the dependency on manual expertise in code porting, and increases accuracy and efficiency in code compilation and debugging.

- Software rebuilding

  Analyzes the x86 software package (in RPM or DEB format) structure and hardware dependency, and rebuilds the software package applicable to the Kunpeng platform.

- Dedicated software porting

  Modifies, compiles, and builds software packages based on the software porting template of the Kunpeng solution, facilitating software porting.

- Enhanced functions

  Provides static checks of software code quality, including 64-bit mode compatibility check, structure byte alignment check, and weak memory ordering check.

The following screen recording shows the main functions of the tool:

- One-click deployment

  ![One-click deployment](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/one_click_deployment.gif)

- Software porting assessment

  ![Software porting assessment](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/software_porting_assessment.gif)

- Source code porting

  ![Source code porting](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/source_code_porting.gif)

- Software rebuilding

  ![Software rebuilding](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/software_rebuilding.gif)

- Dedicated software porting

  ![Dedicated software porting](https://support.huaweicloud.com/faq-paplugin-kunpengdevps/porting_gif/dedicated_software_porting.gif)

## Disclaimer

1. This plugin is intended for enterprise users who need to use the plugin for work. You can use this plugin for work in compliance with laws, regulations, and government policies.
2. No individual or organization shall spread the plugin without the authorization of the plugin owner. You shall not delete the license information or other information in this plugin, or perform reverse engineering, disassembly, or decompilation on this plugin.
3. Unless otherwise specified in laws, regulations, or contracts, this plugin is provided "AS IS" without warranties, guarantees or representations of any kind, either expressed or implied.
4. This plugin is a beta version and is used only for the development and testing environment and open beta test (OBT). The feedback you obtain when you use this plugin is for reference only and does not constitute specific guidance or suggestions in any way or form.
5. You shall bear all risks arising from your use of this plugin. Huawei is not liable for any damage or loss of any nature in any case.
6. If you violate this disclaimer when using this plugin, Huawei is not liable for any consequences and does not assume any legal liabilities. If necessary, the responsible party will be held legally liable.
