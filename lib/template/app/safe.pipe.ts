import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({ name: 'safeHtml' })
export class SafePipeHtml implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }
  transform(value: string): SafeHtml {
    return this.ds.bypassSecurityTrustHtml(value)
  }
}

@Pipe({ name: 'safeStyle' })
export class SafePipeStyle implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }
  transform(value: string): SafeStyle {
    return this.ds.bypassSecurityTrustStyle(value)
  }
}

@Pipe({ name: 'safeScript' })
export class SafePipeScript implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }
  transform(value: string): SafeScript {
    return this.ds.bypassSecurityTrustScript(value)
  }
}

@Pipe({ name: 'safeUrl' })
export class SafePipeUrl implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }
  transform(value: string): SafeUrl {
    return this.ds.bypassSecurityTrustUrl(value)
  }
}

@Pipe({ name: 'safeResUrl' })
export class SafePipeResourceUrl implements PipeTransform {
  constructor(protected ds: DomSanitizer) { }
  transform(value: string): SafeResourceUrl {
    return this.ds.bypassSecurityTrustResourceUrl(value)
  }
}
