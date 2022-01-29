import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { SafePipe } from './safe.pipe'
// desech - start import block
// desech - end import block

@NgModule({
  declarations: [
    // desech - start module block
    // desech - end module block
    AppComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
