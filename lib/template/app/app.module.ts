import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { SafePipeHtml, SafePipeStyle, SafePipeScript, SafePipeUrl, SafePipeResourceUrl } from './safe.pipe'
// desech - start import block
// desech - end import block

@NgModule({
  declarations: [
    // desech - start module block
    // desech - end module block
    AppComponent,
    SafePipeHtml, SafePipeStyle, SafePipeScript, SafePipeUrl, SafePipeResourceUrl
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
