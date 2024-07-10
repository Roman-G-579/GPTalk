import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'bypassSecurity',
  standalone: true
})
export class BypassSecurityPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Takes a string and enables the use of HTML tags in the string, if they exist
   * @param value the input string
   */
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
