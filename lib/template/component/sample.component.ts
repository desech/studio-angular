import { Component, OnInit } from '@angular/core'
// desech - start import block
// desech - end import block

@Component({
  selector: 'SELECTOR',
  templateUrl: './MODULE.component.html'
})
export class CLASSNAMEComponent implements OnInit {
  d:any
  constructor() { }
  ngOnInit(): void {
    // desech - start data block
    // desech - end data block
    this.d = DS.getDesechData(this, desech)
  }
}
