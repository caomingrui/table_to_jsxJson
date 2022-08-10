// 模拟Vue 文件
let vueStr = `
    <template>
  <div class="rl-content rl-block white-bg clearfix">
    <div class="flex bar-center">
      <div class="flex">
        <div>
          打印时间：
          <rl-quick-date @input="loadTable" v-model="usedWaitParams.dateRange" placeholder="日期范围" :default="-2">
          </rl-quick-date>
        </div>
        <div style="margin-left: 10px;">
          发票号从：
          <rl-input v-model="usedWaitParams.startNo" @input="loadTable" maxlength="8" type="text" style="width: 90px; " />
          <span>至</span>
          <rl-input v-model="usedWaitParams.endNo" @input="loadTable" maxlength="8" type="text" style="width: 90px; " />
          <rl-select-base style="width: 100px; display: inline-block;" placeholder="发票归属" remote :remote-method="queryOperator" v-model="selectInvoiceOwner" @input="loadTable" />
          <rl-select-base style="width: 100px; display: inline-block;" placeholder="发票类型" :options="[
            { label: '全部发票', value: '' },
            { label: '结算发票', value: 1 },
            { label: '挂号发票', value: 2 },
          ]" v-model="type" @input="loadTable" />
          <rl-select-base style="width: 100px; display: inline-block;" placeholder="收费来源" :options="[
            { label: '收费来源', value: '' },
            { label: '本院', value: 1 },
            { label: '其他', value: 2 },
          ]" v-model="orderType" @input="loadTable" />
        </div>
      </div>
      <div>
        <rl-input placeholder="患者姓名" v-model="usedWaitParams.userName" @fire="loadTable">
          <rl-button @click="loadTable" slot="append">{{
            $t("commonBtn.search")
          }}</rl-button>
        </rl-input>
        <rl-button @click="exportTxt" color='dark'>导出txt</rl-button>
        <rl-button @click="exportExcel" color='dark'>导出excel</rl-button>
      </div>
    </div>

    <!-- 预约下载 -->
    <div class="btn-downCenter" ref="btn" @mousedown.stop="moveStart($event)">
      <div class="rl-row">
        <div class="btn-content" v-show="dialogTips">
          <p class="btn-tips">
            {{ $t("exportDownload.dataReportGeneration") }}
          </p>
          <p class="btn-tips">
            {{ $t("exportDownload.pleaseDownloadLater") }}
          </p>
        </div>
        <div class="btn-wrapper" @click="dialogCenter = true">
          <p class="i-fff i-center icon-down"></p>
          <p class="i-center">下载</p>
        </div>
      </div>
    </div>

    <div v-if="tableData.length" style="margin-top: 10px;">
      <table class="rl-table rl-table--div rl-table--striped">
        <thead>
          <tr>
            <th>{{ $t("sequenceNumber") }}</th>
            <!-- 发票编号 -->
            <th class="text-center l_r_border">打印时间</th>
            <!-- 发票编号 -->
            <th class="text-center l_r_border">作废时间</th>
            <th>发票类型</th>
            <th>发票编号</th>
            <th>患者姓名</th>
            <th class="text-center l_r_border">交易流水号</th>
            <th class="text-center l_r_border">收费类别</th>
            <th>金额(元)</th>
            <th>发票归属</th>
            <th class="text-center l_r_border">发票代码</th>
            <th>{{ $t("status") }}</th>
            <th class="text-center l_r_border">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data_item, index) in tableData" :key="index">
            <td>{{ index + 1 }}</td>
            <td class="text-center l_r_border">{{data_item.createDate|DATE_TIME}}</td>
            <td class="text-center l_r_border">{{data_item.scrapDate|DATE_TIME}}</td>
            <td>{{ data_item.invoiceType == 1 ? "结算发票" : "挂号发票" }}</td>
            <!-- 发票编号 -->
            <td>{{ data_item.invoiceNo }}</td>
            <!-- 患者姓名 -->
            <td>{{ data_item.userName }}</td>
            <!-- 交易流水号 -->
            <td class="text-center l_r_border">{{ data_item.doneCode }}</td>
            <!-- 收费类别 -->
            <td class="text-center l_r_border">
              {{ buyState(data_item.buyType, data_item.isNegative) }}
            </td>
            <!-- 金额 -->
            <td>{{ $enumeration.getGoodsPrice(data_item.payAmount, 4) }}</td>
            <!-- 发票归属 -->
            <td>{{ data_item.operatorName }}</td>
            <!-- 发票代码 -->
            <td class="text-center l_r_border">{{ data_item.invoiceCode }}</td>
            <!-- 状态 -->
            <td>{{ invoiceState[data_item.state] }}</td>
            <td class="text-center l_r_border">
              <a @click="printInvoice(data_item)">打印</a>
              <a v-show="data_item.state == '1'" @click="resetClick(data_item)">重置</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else style="width:100%; height:100%; text-align:center; margin-top:150px">
      <img src="/static/img/patient_nor.png" />
      <div>暂无信息</div>
    </div>

    <div class="rl-block" v-if="tableData.length">
      <rl-pagination2 @input="loadTable" v-model="usedWaitParams.page" :count="count" :page-size.sync="usedWaitParams.pageSize" />
    </div>

    <!-- 导出下载 -->
    <el-dialog :title="$t('exportDownload.exportDownload')" :visible.sync="dialogExport">
      <div class="export-main">
        <span class="attention-wrapper"><i class="i-attention">!</i></span>
        <p class="export-tips">
          {{ $t("exportDownload.exportDownloadErrInfo") }}
        </p>
      </div>
      <div slot="footer" class="dialog-footer">
        <rl-button color="dark" @click="openDialogCenter">预约下载</rl-button>
        <rl-button @click="dialogExport = false">取 消</rl-button>
      </div>
    </el-dialog>
    <!-- 重置弹窗 -->
    <AlertBox v-if="dialogReset" :show.sync="dialogReset" title="提示" dark content="确定重置为未使用吗?" @onSure="submitSure">
    </AlertBox>
    <!-- 预约下载 -->
    <downloadCenter v-if="dialogCenter" :show.sync="dialogCenter"></downloadCenter>
  </div>
</template>

<script>
import downloadCenter from "components/commonView/downloadCenter.vue";
import AlertBox from 'components/commonView/alert-box.vue'
import _ from "lodash";
import { formatDateBy } from "common/filters.js";
export default {
  data () {
    return {
      tableData: [],
      usedWaitParams: {
        userName: "",
        operatorId: "",
        dateRange: [],
        page: 1,
        pageSize: 10,
        startNo: "",
        endNo: "",
        printStartDate: this.$stringUtils.nowFormat(), //打印开始时间
        printEndDate: this.$stringUtils.dayFormat(1) //打印结束时间
      },
      invoiceState: {
        "0": "删除",
        "1": "已使用",
        "5": "已作废"
      },
      id: "",
      selectInvoiceOwner: "",
      type: "",
      orderType: "",
      dialogTips: false,
      dialogExport: false,
      dialogCenter: false,
      dialogReset: false
    };
  },
  computed: {
    buyState (buyType, isNegative) {
      return function(buyType, isNegative) {
        if (!isNegative) {
          if (buyType == 1) return '处方'
          if (buyType == 2) return '直接销售'
        } else {
          if (buyType == 1) return '处方(取消)'
          if (buyType == 2) return '直接销售(取消)'
        }
      }
    }
  },
  methods: {
    queryOperator (search, token) {
      return this.$http
        .queryOpers(search, 1, undefined, undefined, token)
        .then(resp => {
          let range = [];
          resp.data.map(i => {
            range.push({
              label: i.operatorName,
              value: i
            });
          })
          range.unshift({
            label: "全部",
            value: undefined
          })
          return range;
        });
    },
    moveStart (e) {
      this.clicked = true
      let disY = e.clientY - this.$refs.btn.offsetTop
      document.onmousemove = (e) => {
        let top = e.clientY - disY;
        this.$refs.btn.style.top = top + 'px';
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.clicked = false
      };
    },
    openDialogCenter () {
      this.dialogExport = false
      let param = {
        printStartDate: this.usedWaitParams.printStartDate,
        printEndDate: this.usedWaitParams.printEndDate,
        startNo: this.usedWaitParams.startNo,
        endNo: this.usedWaitParams.endNo,
        operatorId: this.usedWaitParams.operatorId,
        printStartDate: formatDateBy(this.usedWaitParams.dateRange[0], "/"),
        printEndDate: formatDateBy(this.usedWaitParams.dateRange[1], "/"),
        typeName: '使用记录'
      };
      if (!param.printStartDate) delete param["printStartDate"];
      if (!param.printEndDate) delete param["printEndDate"];
      let url = 'ORD_INVOICE'
      this.$http.startDownloadTask(url, param).then(resp => {
        if (resp.code == '00') {
          rlal(resp.msg, 'success')
          this.dialogTips = true
          setTimeout(() => {
            this.dialogTips = false
          }, 1000)
        }
      })
        .catch(err => {
          rlal(err.message, 'error')
        })
    },
    resetClick (item) {
      this.id = item.invoiceOrdId;
      this.dialogReset = true;
    },
    submitSure () {
      this.$http.resetInvoice(this.id).then(resp => {
        if (resp.code == '00') {
          rlal(resp.msg, 'success')
          this.dialogReset = false
          this.loadTable()
        }
      })
        .catch(err => {
          rlal(err.message, 'error')
        })
    },
    loadTable () {
      // bug-3986
      let param = _.cloneDeep(this.usedWaitParams);
      param.printStartDate = formatDateBy(this.usedWaitParams.dateRange[0], "/");
      param.printEndDate = formatDateBy(this.usedWaitParams.dateRange[1], "/");
      param.operatorId = this.selectInvoiceOwner ? this.selectInvoiceOwner.operatorId : undefined;
      param.type = this.type
      param.orderType = this.orderType
      param.pageIndex = (param.page - 1) * param.pageSize;
      delete param.page;
      delete param.dateRange;
      this.$http
        .invoiceUsedList(param)
        .then(resp => {
          if (resp.code == "00") {
            this.tableData = resp.data;
            this.count = resp.iTotalRecords;
          }
        })
        .catch(err => {
          rlal(err.message, "error");
        });
    },
    printInvoice (row) {
      if (row.isNegative == 1) {
        // 退费发票
        this.$print.invoiceRefund(row.payOrderId)
          .catch(err => rlal(err.message, "error"));
      } else {
        if (row.orderType == 1) {
          this.$print.invoice(row.payOrderId, "", row.userName, row.invoiceType, { printOnly: true, invoiceNo: row.invoiceNo })
            .catch(err => rlal(err.message, "error"));
        } else if (row.orderType == 2) {
          this.$http.getOutInvoice(row.orderId).then(resp => {
            if (resp.code == '00') {
              resp.data.invoiceState = 1
              return this.$print.outInvoice(resp.data, 1, true)
            }
          }).then(printResp => {
            this.loadTable()
          }).catch(err => rlal(err.message, "error"));
        }
      }
    },
    exportExcel () {
      this.usedWaitParams.operatorId = this.selectInvoiceOwner ? this.selectInvoiceOwner.operatorId : "";
      this.usedWaitParams.printStartDate = formatDateBy(this.usedWaitParams.dateRange[0], "/");
      this.usedWaitParams.printEndDate = formatDateBy(this.usedWaitParams.dateRange[1], "/");
      var exportPara = {
        printStartDate: this.usedWaitParams.printStartDate,
        printEndDate: this.usedWaitParams.printEndDate,
        startNo: this.usedWaitParams.startNo,
        endNo: this.usedWaitParams.endNo,
        operatorId: this.usedWaitParams.operatorId,
        type: this.type,
        orderType: this.orderType
      };

      let spaceMonths = this.$stringUtils.getMonthsSpace(
        exportPara.printStartDate,
        exportPara.printEndDate
      );
      if (spaceMonths > 3) {
        // 导出时间大于3个月的，需要预约下载
        this.dialogExport = true
        return false
      }

      if (!exportPara.printStartDate) delete exportPara["printStartDate"];
      if (!exportPara.printEndDate) delete exportPara["printEndDate"];
      if (!exportPara.startNo && String(exportPara.startNo) != '0') delete exportPara["startNo"];
      if (!exportPara.endNo && String(exportPara.endNo) != '0') delete exportPara["endNo"];
      if (!exportPara.operatorId && String(exportPara.operatorId) != '0') delete exportPara["operatorId"];
      console.log("exportPara------->" + JSON.stringify(exportPara));
      this.$export("ORD_INVOICE", exportPara);
    },
    // 导出txt
    exportTxt () {
      this.usedWaitParams.operatorId = this.selectInvoiceOwner ? this.selectInvoiceOwner.operatorId : "";
      this.usedWaitParams.userName = this.selectInvoiceOwner ? this.selectInvoiceOwner.operatorName : "";
      this.usedWaitParams.printStartDate = formatDateBy(this.usedWaitParams.dateRange[0], "/");
      this.usedWaitParams.printEndDate = formatDateBy(this.usedWaitParams.dateRange[1], "/");
      var exportPara = {
        userName: this.usedWaitParams.userName,
        operatorId: this.usedWaitParams.operatorId,
        printStartDate: this.usedWaitParams.printStartDate,
        printEndDate: this.usedWaitParams.printEndDate,
        startNo: this.usedWaitParams.startNo,
        endNo: this.usedWaitParams.endNo,
        type: this.type,
        orderType: this.orderType
      };
      if (!exportPara.userName) delete exportPara["userName"];
      if (!exportPara.operatorId && String(exportPara.operatorId) != '0') delete exportPara["operatorId"];
      if (!exportPara.printStartDate) delete exportPara["startDate"];
      if (!exportPara.printEndDate) delete exportPara["endDate"];
      if (!exportPara.startNo && String(exportPara.startNo) != '0') delete exportPara["startNo"];
      if (!exportPara.endNo && String(exportPara.endNo) != '0') delete exportPara["endNo"];
      this.$export("", exportPara, '/clinic/order/invoice/list/hz/out');
    }
  },
  components: {
    downloadCenter,
    AlertBox
  }
};
</script>

<style lang="scss" scoped>
.btn-downCenter {
  top: 115px;
}
.flex {
  display: flex;
}
.bar-center {
  justify-content: space-between;
}
</style>

`;

export default vueStr;


