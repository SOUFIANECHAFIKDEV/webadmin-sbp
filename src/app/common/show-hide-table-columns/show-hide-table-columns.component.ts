import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'show-hide-table-columns',
  templateUrl: './show-hide-table-columns.component.html',
  styleUrls: ['./show-hide-table-columns.component.scss']
})
export class ShowHideTableColumnsComponent implements OnInit {
  showList: boolean = false;

  @Input("columns") columns: never[];
  @Input("tableName") tableName: string;
  @Input("btnLabel") Label: string;
  @Output("selectColumn") select = new EventEmitter()
  @Input("checkedColumns") checked: boolean[];

  @Input("showAll") showAll: string;
  @Input("showNone") showNone: string;

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.checked && this.checked.length == this.columns.length) {
        for (let index = 0; index < this.columns.length; index++) {
          this.ColumnSelected(this.columns[index], index, this.checked[index]);
        }
      }
    }, 1000)
  }

  changeShowList(): void {
    this.showList = !this.showList;
  }

  ColumnSelected(column: never, index: number, op?: boolean) { ;
    this.checked = this.checked.slice(0, this.columns.length)
    if (op == undefined) this.type = null;
    let rowIndex = this.columns.indexOf(column)
    if (rowIndex != -1) {
      this.putValuesInCHeckVariable(this.columns.length);

      let table = document.getElementById(this.tableName);
      let th = table.getElementsByTagName('th')[rowIndex];


      if (op == undefined) {
        this.checked[index] = !this.checked[index];
        th.style.display = th.style.display == "" ? "none" : "";
      } else {
        this.checked[index] = op;
        th.style.display = op ? "none" : "";
      }

      this.setCheckedColmun()

      let row = table.getElementsByTagName('tr');
      for (let index = 0; index < row.length; index++) {
        let row = table.getElementsByTagName('tr')[index + 1];
        if (row == undefined) return;
        let cells = row.getElementsByTagName('td')[rowIndex];
        if (cells == undefined) return;

        if (op == undefined) {
          cells.hidden = !cells.hidden
        } else {
          cells.hidden = op;
        }
      }
    }
  }

  putValuesInCHeckVariable(length: number) {
    if (this.checked != []) {
      for (let index = 0; index < length; index++) {
        this.checked.push(false)
      }
    }
  }
  type: boolean = null;
  operations(type) {
    
    switch (type) {
      case 'none':
        if (this.type || this.type == null) {
          for (let index = 0; index < this.columns.length; index++) {
            this.ColumnSelected(this.columns[index], index, true);
          }
          this.type = this.type == null ? false : !this.type;
        }
        this.setCheckedColmun()
        break;
      case 'all':
        if (!this.type || this.type == null) {
          for (let index = 0; index < this.columns.length; index++) {
            this.ColumnSelected(this.columns[index], index, false);
          }
          // this.type = !this.type;
          this.type = this.type == null ? true : !this.type;
        }
        this.setCheckedColmun()
        break;
      case 'restore':

        break;
    }
  }

  setCheckedColmun() {
    this.select.emit(this.checked.slice(0, this.columns.length))
  }
}
