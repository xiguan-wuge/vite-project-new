<!--
 * @Author: xiguan wuge 1584077483@qq.com
 * @Date: 2025-02-24 00:32:13
 * @LastEditors: xiguan wuge 1584077483@qq.com
 * @LastEditTime: 2026-03-21 23:07:12
 * @FilePath: /vite-project-new/src/components/elementPlus/tableDemo.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="jsx">
export default {
  name: 'table-demo',
  data() {
    return {
      tableData: [
        {
          name: '张三',
          date: new Date()
        }
      ]
    }
  },
  render() {
    return (
      <el-table data={this.tableData}
        v-slots={{
          empty: () => <div>这是empty内容</div>
        }}
      >
        <el-table-column
            prop="date"
            label="Date"
            width="180"
          />
          <el-table-column
            prop="name"
            label="Name"
            v-slots={{
              default: ({ row }) => <el-tag type="success">{row.name}</el-tag>
            }}
          />
        
      </el-table>
    )
  }
}
</script>