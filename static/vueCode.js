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
              <th width="100px">{{ $t('amount') }}</th>
            </tr>
            <tr v-for="(row, index) of tableData">
              <td>{{row.doctorName}}</td>
              <td>{{hospitalName(row.hospitalId)}}</td>
              <td>{{row.prescriptionOrdNum}}</td>
              <td>{{row.totalPriceLt30}}</td>
              <td>{{row.totalPriceLt3040}}</td>
              <td>{{row.totalPriceLt4050}}</td>
              <td>{{row.totalPriceLt50 | CNY}}/{{row.kkkk}}</td>
              <td>
                <span>{{row.amount}}</span>
              </td>
              <td>{{row.totalPrice|CNY}}</td>
              <td>{{ row.payPrice | CNY }}</td>
              <td>{{row.registeredOrdCount}}</td>
              <td>{{(cny(row.payPrice) / row.registeredOrdCount).toFixed(2)}}</td>
              <td>{{(cny(row.payPrice) / row.amount).toFixed(2)}}</td>
              <td>{{row.feeDetailOrdCountIt20}}</td>
              <td>{{row.feeDetailOrdCountIt25}}</td>
              <td>
                <span v-if="row.state === 1">我是正常 {{row.state | CNY}}</span>
                <span v-else-if="row.state === 2">我是异常</span>
                <div v-else>????</div>
              </td>
              <td>
                <a href="">{{$t('medicalRecord')}}</a>
              </td>
            </tr>
          </table>
    </template>

    <script>
    import {test} from "./index";
    import {AA} from "./index";
    export default {
      data () {
        return {
          greeting: "Hello",
          query: {
              pageSize: 10,
              page: 1,
              dateRange: [],
              medicalDisease: undefined,
              searchKey: undefined,
              searchValue: undefined,
              hospitalId: undefined,
              commentState: undefined
          }
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

// <template>
//     <div class="rl-content">
//         <div>
//             <div class="rl-toolbar rl-block">
//                 <div class="rl-toolbar-block">
//                     <rl-quick-date @input="search(1)"
//                     v-model="query.dateRange"
//                     :default="0" />
//                     <rl-select-base @input="search(1)"
//                     v-model="query.medicalDisease"
//                     :placeholder="$t('diseaseType')"
//                     :options="diseaseType"
//                     style="width:150px; display:inline-block;">
//                 </rl-select-base>
//                 <rl-select-base @input="search(1)"
//                 v-model="query.hospitalId"
//                 :placeholder="$t('institutionName')"
//                 :options="clinicOptions"
//                 style="width:150px; display:inline-block;">
//             </rl-select-base>
//             <rl-select-base @input="search(1)"
//             v-model="query.commentState"
//             :placeholder="$t('commentType')"
//             :options="contentStateOptions"
//             style="width:150px; display:inline-block;">
//         </rl-select-base>
//         <rl-input @fire="search(1)"
//         prependWidth='90'
//         v-model="query.searchValue">
//         <rl-select-base @input="search(1)"
//         autoSelect
//         :options="searchTypes"
//         slot="prepend"
//         v-model="query.searchKey" />
//         <rl-button @click="search(1)"
//         slot="append">{{$t('commonBtn.search')}}</rl-button>
// </rl-input>
// </div>
// </div>
// <div class="rl-block overflow-auto">
//     <table class="rl-table rl-table--div rl-table--striped">
//         <thead>
//         <tr>
//             <th>{{$t('institutionName')}}</th>
//             <th>{{$t('department')}}</th>
//             <th>{{$t('physician')}}</th>
//             <th>{{$t('time')}}</th>
//             <th>{{$t('consultationNum')}}</th>
//             <th>{{$t('customerName')}}</th>
//             <th>{{$t('diseaseType')}}</th>
//             <th>{{$t('formBaseInfo.sexLabel')}}</th>
//             <th>{{$t('formBaseInfo.ageLabel')}}</th>
//             <th>{{$t('formBaseInfo.contactsPhone')}}</th>
//             <th>{{$t('occupation')}}</th>
//             <th>{{$t('workplace')}}</th>
//             <th width="200px">{{$t('formBaseInfo.address')}}</th>
//             <th>{{$t('dateOfOnset')}}</th>
//             <th>{{$t('primaryDiagnosis')}}</th>
//             <th>{{$t('definiteDiagnosis')}}</th>
//             <th>{{$t('firstVisitOrReturnvisit')}}</th>
//             <th>{{$t('commentStatus')}}</th>
//             <th width="100px">{{$t('operation')}}</th>
//         </tr>
//         </thead>
//         <tbody>
//         <tr v-for="(data_item,index) in tableData">
//             <td>{{data_item.hospitalName}}</td>
//             <td>{{data_item.departName}}</td>
//             <td>{{data_item.doctorName}}</td>
//             <td>{{data_item.createDate|DATE_TIME}}</td>
//             <td>{{data_item.registeredOrdId}}</td>
//             <td><a @click="reception(data_item)">{{data_item.userName}}</a></td>
//         <td>{{ data_item.medicalTypeStr }}</td>
//         <td>{{data_item.userSex|SEX}}</td>
//         <td>{{data_item.birthdayDate|AGE}}</td>
//         <td>{{data_item.billId}}</td>
//         <td>{{data_item.occupation}}</td>
//         <td>{{data_item.company}}</td>
//         <td>{{data_item.userAddress}}</td>
//         <td>{{data_item.createDate|DATE_TIME}}</td>
//         <td>{{data_item.diagnosis}}</td>
//         <td>{{data_item.realDiagnosis}}</td>
//         <td>{{data_item.registeredType|REG_TYPE}}</td>
//         <td>
//             <span v-if="data_item.commentState=='0'">{{$t('notCommented')}}</span>
//             <a v-if="data_item.commentState=='1'"
//             @click="clickComment(data_item)">{{$t('commented')}}</a>
//         </td>
//         <td>
//             <a class="oper-btn"
//             @click="reception(data_item)">{{$t('medicalRecord')}}</a>
//     </td>
// </tr>
// </tbody>
// </table>
// </div>
// </div>
// <div class="rl-block">
//     <rl-pagination2 @input="search"
//     v-model="query.page"
//     :count="totalCount"
//     :page-size.sync="query.pageSize" />
// </div>
// <el-dialog :title="$t('callSettings')"
// :visible.sync="dialog.show"
// width="50%"
// center>
// <div class="rl-row rl-row-gutter">
//     <rl-form-item class="rl-col-12"
// :label="$t('clinic')">
//     <rl-select-base :placeholder="$t('clinic')"
// :options="queryDepart"
// v-model="roomId"
// style="display:inline-block;" />
//     </rl-form-item>
// </div>
// <div class="dialog-footer"
//      slot="footer">
//     <rl-button color="dark"
//                large
//     @click="save">{{$t('commonBtn.save')}}</rl-button>
// <rl-button color="line"
//            large
//                    @click="dialog.show=false">{{$t('commonBtn.cancel')}}</rl-button>
// </div>
// </el-dialog>
// <rl-window :show.sync="dialogComment"
// :title="$t('info.comments')">
//     <DialogComment
// :registeredOrdId="registeredOrdId"
// :contentObj="contentObj"
// @close="onClose"></DialogComment>
// </rl-window>
//
// </div>
// </template>
//
// <script>
//     import MixIn from "../report/mixin";
//     import { formatDateBy } from "common/filters.js";
//     import DialogComment from '../patients_manage/dialog_comment.vue';
//     let that;
//     export default {
//     mixins: [MixIn],
//     components: {
//     DialogComment
// },
//     data () {
//     return {
//     activeIndex: -1,
//     tableData: [],
//     totalCount: 0,
//     query: {
//     pageSize: 10,
//     page: 1,
//     dateRange: [],
//     medicalDisease: undefined,
//     searchKey: undefined,
//     searchValue: undefined,
//     hospitalId: undefined,
//     commentState: undefined
// },
//     dialog: {
//     show: false,
//     editorData: undefined
// },
//     roomId: undefined,
//     id: "",
//     name: undefined,
//     searchTypes: [
// { label: this.$t('customerName'), value: "userName" },
// { label: this.$t('doctorName'), value: "doctorName" },
// { label: this.$t('primaryDiagnosis'), value: "diagnosis" }
//     ],
//     contentStateOptions: [
// { label: this.$t('all'), value: undefined },
// { label: this.$t('commented'), value: 1 },
// { label: this.$t('notCommented'), value: 0 }
//     ],
//     clinicOptions: [],
//     dialogComment: false,
//     registeredOrdId: undefined,
//     contentObj: undefined
// };
// },
//     // filters: {
//     //   SPEC_DIS: function (val, val1, item) {
//     //     let hospitalId = that.$store.state.account.hospitalId;
//     //     console.log('val',val)
//     //     console.log('val1',val1)
//     //     console.log('item',item)
//     //     let info = '';
//     //     if (item.medicalCode == 'ZJ_PROV_SELF') {
//     //       info = '(浙江省医保)';
//     //     }
//     //     if (item.medicalCode == 'ZJ_CITY') {
//     //       info = '(杭州市医保)';
//     //     }
//     //     if (item.medicalCode == 'MC_JINHUA') {
//     //       info = '(金华市医保)';
//     //     }
//     //     let num = val + "" + val1
//     //     switch (num) {
//     //       case "01":
//     //         return "普通病种" + info;
//     //       case "00":
//     //         return "自费";
//     //       case "11":
//     //         return "规定病种" + info;
//     //       case "-1-1":
//     //         return "无（零售）";
//     //       default:
//     //         return "普通病种";
//     //     }
//     //   }
//     // },
//     created () {
//     this.optionsHospital();
// },
//     methods: {
//     onClose () {
//     this.dialogComment = false;
//     this.search()
// },
//     optionsHospital () {
//     this.$http.getChainClinic().then(resp => {
//     this.clinicOptions = resp.data.map(i => {
//     return {
//     label: i.hospitalName,
//     value: i.hospitalId
// }
// })
//     // this.clinicOptions.unshift({
//     //   label: '全部诊所',
//     //   value: ''
//     // })
//     return this.clinicOptions
// })
// },
//     clickComment (item) {
//     this.registeredOrdId = item.registeredOrdId;
//     this.contentObj = {
//     state: item.commentState,
//     content: item.comment
// }
//     this.dialogComment = true;
// },
//     queryDepart: function () {
//     return this.$http.getClinicRoom().then(resp => {
//     let data = resp.data.filter(i => i.state == 1);
//     return data.map(i => {
//     return {
//     label: i.roomName,
//     value: i.consultingRoomId
// };
// });
// });
// },
//     search (val) {
//     if (val) {
//     this.query.page = val;
// }
//     let param = Object.assign({}, this.query);
//     if (this.query.searchValue) {
//     param[this.query.searchKey] = this.query.searchValue;
// }
//     if (this.query.dateRange && this.query.dateRange.length == 2) {
//     param.startDate = formatDateBy(this.query.dateRange[0], "/");
//     param.endDate = formatDateBy(this.query.dateRange[1], "/");
// }
//     if (param.medicalDisease) {
//     console.error('===', param.medicalDisease)
//     param.isMedicalInsurance = param.medicalDisease.isMedicalInsurance;
//     param.isPrescribedDisease = param.medicalDisease.isPrescribedDisease;
//     param.medicalCode = param.medicalDisease.medicalCode;
// }
//     param.pageIndex = (param.page - 1) * param.pageSize;
//     delete param.medicalDisease;
//     delete param.page;
//     delete param.searchKey;
//     delete param.searchValue;
//     delete param.dateRange;
//     this.$http
//     .getClinicLog(
//     param
//     ).then(resp => {
//     this.totalCount = Number(resp.iTotalRecords);
//     this.tableData = resp.data;
// });
// },
//     save () {
//     const loading = this.$loading({
//     lock: true,
//     text: "保存中...",
//     background: "rgba(255, 255, 255, 0.4)"
// });
//     this.$http
//     .addCallNum(this.id, this.roomId)
//     .then(resp => {
//     rlal(resp.msg, "success");
//     this.dialog.show = false;
//     this.search();
//     loading.close();
// })
//     .catch(err => {
//     rlal(err.message, "error");
//     loading.close();
// });
// },
//     //查看详情
//     reception (obj, index = 1) {
//     this.$store.dispatch("medicine_compile_user_id", obj.userId);
//     if (obj.commentState == '1') {
//     let conentObj = {
//     state: obj.commentState,
//     content: obj.content
// }
//     sessionStorage.setItem('conentObj', JSON.stringify(conentObj))
// }
//     let inFrame = window.parent !== window;
//     if (inFrame) {
//     let url = window.location.href.replace(
//     /\#.+$/,
//     "#/patients_manage/patient_detail?userId=" +
//     obj.userId +
//     "&selectedIndex=" +
//     index +
//     "&chain=1&createDate=" + obj.createDate
//     );
//     let ev = new Event("addTab");
//     ev.url = url;
//     ev.title =this.$t('formBaseInfo.baseInfo');
//     window.parent.dispatchEvent(ev);
// } else {
//     this.$router.push(
//     "/patients_manage/patient_detail?userId=" +
//     obj.userId +
//     "&selectedIndex=" +
//     index +
//     "&chain=1&createDate=" + obj.createDate
//     );
// }
// },
// },
//     beforeCreate: function () {
//     that = this;
// },
// };
// </script>
//
// <style lang="scss" scoped>
//     .oper-btn {
//     margin-right: 15px;
// }
// </style>
