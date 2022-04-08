import { Injectable } from '@angular/core';
import { TiFileInfo } from '@cloud/tiny3';
import { Cat } from 'hyper';
import * as XLSX from 'xlsx';
import { BatchNodeInfo } from '../../domain';
import { VerificationWay } from '../../util';

const importKeyMap = new Map<string, string>([
  ['__EMPTY', 'node_name'],
  ['__EMPTY_1', 'ip'],
  ['__EMPTY_2', 'port'],
  ['__EMPTY_3', 'agent_install_path'],
  ['__EMPTY_4', 'user_name'],
  ['__EMPTY_5', 'verification_method'],
  ['__EMPTY_6', 'password'],
  ['__EMPTY_7', 'identity_file'],
  ['__EMPTY_8', 'passphrase'],
  ['__EMPTY_9', 'root_password'],
]);

const deleteKeyMap = new Map<string, string>([
  ['__EMPTY', 'ip'],
  ['__EMPTY_1', 'user_name'],
  ['__EMPTY_2', 'verification_method'],
  ['__EMPTY_3', 'password'],
  ['__EMPTY_4', 'identity_file'],
  ['__EMPTY_5', 'passphrase'],
  ['__EMPTY_6', 'root_password'],
]);

const keyHandleFn = new Map<string, (val: any) => any>([
  ['node_name', (val: any) => val?.toString()?.trim() ],
  ['ip', (val: any) => val?.toString()?.trim() ],
  ['port', (val: any) => val ],
  ['agent_install_path', (val: any) => val?.toString()?.trim() ],
  ['user_name', (val: any) => val?.toString()?.trim() ],
  ['verification_method', (val: any) => val?.toString()?.trim() ],
  ['password', (val: any) => val?.toString()?.trim() ],
  ['identity_file', (val: any) => val?.toString()?.trim() ],
  ['passphrase', (val: any) => val?.toString()?.trim() ],
  ['root_password', (val: any) => val?.toString()?.trim() ],
]);


@Injectable({
  providedIn: 'root',
})
export class ExcelParseService {
  static IDENTIFY_XLSX_INDEX = 'EMPTY';
  static EFFECTIVE_START_ROW_INDEX = 3;

  /**
   * 解析导入模板的 Excel 文件
   * @param file 文件对象
   * @param resolve resolve函数
   * @param reject reject函数
   */
  async parseImportExcel(
    file: TiFileInfo,
    resolve: (value: BatchNodeInfo[]) => void,
    reject: (err: any) => void
  ) {
    try {
      const rawList = await this.parseExcel(file);
      const tempList = this.xlsxJsonToObj(rawList, importKeyMap);
      const pureList = this.optimizeXlsxObj(tempList);
      resolve(pureList);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 解析导入模板的 Excel 文件
   * @param file 文件对象
   * @param resolve resolve函数
   * @param reject reject函数
   */
  async parseDeleteExcel(
    file: TiFileInfo,
    resolve: (value: BatchNodeInfo[]) => void,
    reject: (err: any) => void
  ) {
    try {
      const rawList = await this.parseExcel(file);
      const tempList = this.xlsxJsonToObj(rawList, deleteKeyMap);
      const pureList = this.optimizeXlsxObj(tempList);
      resolve(pureList);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 解析 Excel 文件
   * @param file 文件对象
   */
  private parseExcel(file: TiFileInfo): Promise<any[]> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const data = e.target.result;

        const workbook = XLSX.read(data, {
          type: 'buffer',
        });
        const rawList = (XLSX.utils as any).sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
        resolve(rawList);
      };
      reader.onerror = (err: any) => {
        reject(err);
      };
      reader.readAsArrayBuffer(file._file);
    });
  }

  /**
   * 将 xlsx 的信息转换为节点信息
   * @param rowObj xlsx文件对应的对象
   * @param keyMap 数据的xlsx索引和节点信息的键值的对应关系
   * @returns 节点信息
   */
  private xlsxJsonToObj(
    rowObj: any[],
    keyMap: Map<string, string>
  ): BatchNodeInfo[] {
    const batchNodeInfo = rowObj
      ?.slice(ExcelParseService.EFFECTIVE_START_ROW_INDEX)
      ?.map((row) => {
        const tempObj: {
          [key in string]: any;
        } = {};
        Array.from(keyMap.keys()).forEach((rowKey) => {
          const objKey = keyMap.get(rowKey);
          const valHandleFn = keyHandleFn.get(objKey);
          tempObj[objKey] = valHandleFn?.(row[rowKey]);
        });

        const count = Object.keys(row)?.[0]?.includes(
          ExcelParseService.IDENTIFY_XLSX_INDEX
        )
          ? void 0
          : Object.values(row)[0];
        return { ...tempObj, count };
      })
      .filter((obj: any) => {
        // 有序号，有内容，才是有效的一条数据
        const parseObj = JSON.parse(JSON.stringify(obj));
        const count = parseObj.count;
        delete parseObj.count;

        return Cat.isNum(count) && !Cat.isEmpty(parseObj);
      });

    return batchNodeInfo as BatchNodeInfo[];
  }

  /**
   * 将认证方式从口语替换成标识
   * @param xlsxObjList xlsx的解析数据
   */
  private optimizeXlsxObj(xlsxObjList: BatchNodeInfo[]): BatchNodeInfo[] {
    xlsxObjList.forEach((xlsxObj) => {
      xlsxObj.verification_method = VerificationWay.langToMark(
        xlsxObj.verification_method
      );
    });
    return xlsxObjList;
  }
}
