import { Component, OnInit, Input } from '@angular/core'
// desech - start import block
// desech - end import block

@Component({
  selector: 'SELECTOR',
  templateUrl: './MODULE.component.html'
})

export class CLASSNAMEComponent implements OnInit {
  // desech - start props block
  // desech - end props block

  ngOnInit(): void {
    // desech - start data block
    // desech - end data block
    this.d = DS.getDesechData(this, desech)
  }
}
