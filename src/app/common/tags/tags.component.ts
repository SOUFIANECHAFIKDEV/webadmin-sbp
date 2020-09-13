import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges } from '@angular/core';

@Component({
  selector: 'ino-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, OnChanges {
  @Input("allTagsList") allTagsList: { value: string, origine: boolean }[];
  @Output("onTagsChange") onTagsChange = new EventEmitter();
  @Input("readOnly") readOnly: boolean = true;
  @Input("newTags") newTags = [];
  @ViewChild("inputString") public inputString;
  AutoComplete = []
  @Input('load') load: { emptyList };
  @Input('size') size = 'large';
  ngOnInit() {
    setInterval(() => {
      this.onTagsChange.emit(this.newTags);
    }, 1000)
  }

  ngOnChanges() {

    this.load.emptyList = this.emptyList.bind(this);
  }
  emptyList() {
    this.newTags = [];
  }

  addNewTags(newTags, i) {

    const isE = ((this.newTags.filter(res => res.value.toLocaleLowerCase() == newTags.value.toLocaleLowerCase()).length) == 0);
    if (!isE) {
      this.showTagsValidation = true;
      setTimeout(() => {
        this.showTagsValidation = false;
      }, 2000);
      return;
    }
    this.newTags.push(newTags);
    this.AutoComplete = [];
    this.allTagsList.splice(i, 1);
    this.onTagsChange.emit(this.newTags);
    this.showTagsValidation = false;
    this.inputString.nativeElement.value = '';
  }
  showTagsValidation: boolean = false;
  addNewTagsFromInputClick() {

    let newTags = this.inputString.nativeElement.value;
    if (!this.checkTagIsUnique(this.allTagsList, newTags)) {
      this.showTagsValidation = true;
      setTimeout(() => {
        this.showTagsValidation = false;
      }, 2000);
      return;
    }
    if (newTags != '') {
      this.newTags.push({ value: newTags, origine: false });
      this.allTagsList.forEach((tag, i) => {
        if (tag.value == newTags) {
          this.allTagsList.splice(i, 1);
        }
      });
      this.onTagsChange.emit(this.newTags);
      this.AutoComplete = [];
      this.inputString.nativeElement.value = '';
      this.showTagsValidation = false;
    }
  }

  checkTagIsUnique(tagsList: { value: string, origine: boolean }[], tag: string): boolean {

    let isE = true;
    tagsList.forEach(t => {
      if (t.value.toLowerCase() == tag.toLowerCase()) {
        isE = false;
      }
    });

    isE = ((this.newTags.filter(res => res.value.toLocaleLowerCase() == tag.toLocaleLowerCase()).length) == 0);
    return isE;
  }

  tagsInputkeyup(value, event) {


    if (event.code == "Enter") {
      this.addNewTagsFromInputClick()
      return;
    }
    this.AutoComplete = [];
    this.allTagsList.forEach((tag, i) => {
      if (tag.value.toUpperCase().indexOf(value.toUpperCase()) > -1 && value != '') {
        this.AutoComplete.push(tag);
      }
    });
    this.onTagsChange.emit(this.newTags);
  }

  removeTag(tag, i) {
    if (tag.origine) {
      this.allTagsList.push(tag);
    }
    this.newTags.splice(i, 1);
    this.onTagsChange.emit(this.newTags);
    this.AutoComplete = [];
  }

  showAllTags() {

    if (this.AutoComplete.length == 0) {
      this.AutoComplete = this.allTagsList;
    } else if (this.AutoComplete = this.allTagsList) {
      this.AutoComplete = [];
    } else {
      this.AutoComplete = [];
    }

    // this.AutoComplete = (this.AutoComplete == this.allTagsList) ? [] : this.allTagsList;
  }

}
