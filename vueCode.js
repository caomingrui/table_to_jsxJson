// 模拟Vue 文件
let vueStr = `
    <template>
      <table class="rl-table rl-table--div rl-table--striped">
            <tr>
              <th>医生</th>
              <th>诊所名称</th>
              <th>处方总数</th>
              <th>每贴=30的处方数</th> 
              <th>每贴>30且=40的处方数</th>
              <th>每贴>40且=50的处方数</th> 
              <th>每贴>50元处方数</th>
              <th>处方贴数</th>
              <th>处方折后金额</th>
              <th>处方实收金额</th>
              <th>人次</th>
              <th>次均费用</th>
              <th>贴均费用</th>
              <th>味数超过20的处方数</th>
              <th>味数超过25的处方数</th>
              <th>总味数</th>
              <th>{{ $t('amount') }}</th>
            </tr>
            <tr v-for="row of tableData">
              <td>{{row.doctorName}}</td>
              <td>{{hospitalName(row.hospitalId)}}</td>
              <td>{{row.prescriptionOrdNum}}</td>
              <td>{{row.totalPriceLt30}}</td>
              <td>{{row.totalPriceLt3040}}</td>
              <td>{{row.totalPriceLt4050}}</td>
              <td>{{row.totalPriceLt50}}</td>
              <td>{{row.amount}}</td>
              <td>{{row.totalPrice|CNY}}</td>
              <td>{{ row.payPrice | CNY }}</td>
              <td>{{row.registeredOrdCount}}</td>
              <td>{{(cny(row.payPrice) / row.registeredOrdCount).toFixed(2)}}</td>
              <td>{{(cny(row.payPrice) / row.amount).toFixed(2)}}</td>
              <td>{{row.feeDetailOrdCountIt20}}</td>
              <td>{{row.feeDetailOrdCountIt25}}</td>
              <td>
                <span v-if="row.state === 1">我是正常</span>
                <span v-if="row.state === 2">我是异常</span>
              </td>
              <td>{{(row.feeDetailOrdCount / row.prescriptionOrdNum).toFixed(2)}}</td>
            </tr>
          </table>
    </template>

    <script>
    import {test} from "./index";
    import {AA} from "./index";
    export default {
      data () {
        return {
          greeting: "Hello"
        };
      },
      method: {
          reload() {
            let startDate = formatDateBy(this.query.dateRange[0], "/");
            let endDate = formatDateBy(this.query.dateRange[1], "/");
            this.$http
                .getDayReportList(
                    startDate,
                    endDate,
                    this.query.operId,
                    this.pagination.pageSize,
                    this.pagination.page
                )
                .then((resp) => {
                    this.tableData = resp.data;
                    this.pagination.count = Number(resp.iTotalRecords);
                    this.summaryData = resp.total[0] || {};
                }, this.onError);
        },
      }
    };
    </script>

    <style scoped>
    p {
      font-size: 2em;
      text-align: center;
    }
    </style>
`;

export default vueStr;