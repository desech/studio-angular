import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({
  name: 'safe'
})

export class SafePipe implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }

  transform(value: string, type: string = null): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.ds.bypassSecurityTrustHtml(value)
      case 'style':
        return this.ds.bypassSecurityTrustStyle(value)
      case 'script':
        return this.ds.bypassSecurityTrustScript(value)
      case 'url':
        return this.ds.bypassSecurityTrustUrl(value)
      case 'resourceUrl':
      default:
        return this.ds.bypassSecurityTrustResourceUrl(value)
    }
  }
}
