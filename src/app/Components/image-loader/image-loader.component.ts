import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.css']
})
export class ImageLoaderComponent implements OnInit {

  @Input('imageSource') imageSource: any;
  @ViewChild('divIntersectContainer') divIntersectContainer: ElementRef;
  @ViewChild('imageEl') imageEl: ElementRef; 
  @ViewChild('imageProgress') imageProgress: ElementRef; 

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  observerCallback(entries, observer){
    for(let i=0;i<entries.length;i++){
      let entry = entries[i];
      if(entry.isIntersecting
         && entry.target.className === 'intersectContainer')
         {
          entry.target.querySelector('.lds-ring').className='hidden';
          this.imageProgress.nativeElement.className = 'imageProgress';
          let imgSrc = this.imageEl.nativeElement.getAttribute('data-imagesrc');

          this.http.get(imgSrc,
            {
              responseType:'blob',
              reportProgress:true,
              observe: "events",
              headers: new HttpHeaders(
                { 'Content-Type': 'application/json' })
            })
            .subscribe(event=>{
              if(event.type === HttpEventType.DownloadProgress){
                const percentage = 100 / event.total * event.loaded;
                this.imageProgress.nativeElement.value = percentage;
              }

              if(event.type === HttpEventType.Response){
                entry.target.className = 'hidden';
                this.imageEl.nativeElement.src = window.URL.createObjectURL(event.body);
                this.imageEl.nativeElement.className = '';
              }
            });

            observer.unobserve(entry.target);
         }
    }
  }

  ngAfterViewInit(){
    let options = {
      root:null,
      rootMargin:'0px',
      threshold:1
    };

    let observer = new IntersectionObserver(this.observerCallback.bind(this), options);
    observer.observe(this.divIntersectContainer.nativeElement);
  }

}
