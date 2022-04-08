import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'threePoint' })


export class ThreePoint implements PipeTransform {
    /**
     * transform
     * @param value value
     * @param fix fix
     */
    transform(value, fix: number) {
        if ((value && Number(value)) || Number(value) === 0) {
            if (Number(value) === 0) { return 0; }
            value = Number(value).toFixed(fix);
            if (value % 1 === 0) {                             // 如果是整数
                const reg = /(?=(\B)(\d{3})+$)/g;
                return value.toString().replace(reg, ',');
            } else {
                return value
                    .toString()
                    .replace(/(\d)(?=(\d{3})+\.)/g, ($1, $2) => {
                        return $2 + ',';
                    });
            }
        } else {
            return value;
        }
    }
}
