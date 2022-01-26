import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AppComponent } from './app.component'
// desech - start import block
// desech - end import block

// @NgModule decorator with its metadata
@NgModule({
  declarations: [
    AppComponent,
    // desech - start module block
    // desech - end module block
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
