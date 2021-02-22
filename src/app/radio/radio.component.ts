import {Component, OnInit, AfterContentInit, ɵsetDocument, Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css']
})
export class RadioComponent implements OnInit {

  public data:any=[];
  radios = [];
  recent = [];
  fav = [];
  recentMax = 5 ;
  actualRadio = '';
  x = '';
  volume = 0;

  constructor(private http: HttpClient, public cookieService: CookieService) { }

  link = 'http://localhost:8888/radio';

  changeVolume(){
    // @ts-ignore
    let valeur = document.getElementById('myRange').value;
    console.log(valeur);
    // @ts-ignore
    document.getElementById('audio').volume = valeur/100;
  }

  static setLocal(key: string, value: any){
    localStorage.setItem(key, value);
  }

  getLocal(key: string){
    // @ts-ignore
    return localStorage.getItem(key);
  }

  deleteLocal(key : string){
    localStorage.removeItem(key);
  }

  changeRadio(url: string, name : string){  //Change the audio source and change the img
    // @ts-ignore
    document.getElementById('audio').setAttribute('src', url);
    // @ts-ignore
    document.getElementById('play').style.display = 'flex';
    // @ts-ignore
    document.getElementById('pause').style.display = 'none';

    this.actualRadio = name;

    let inFav = false;

    for(let i of this.fav){
      if (i[0] == this.actualRadio){
        inFav = true;
      }
    }

    if(inFav){
      // @ts-ignore
      document.getElementById('fav-icon-full').style.display = 'flex';
      // @ts-ignore
      document.getElementById('fav-icon').style.display = 'none';
    }
    else {
      // @ts-ignore
      document.getElementById('fav-icon').style.display = 'flex';
      // @ts-ignore
      document.getElementById('fav-icon-full').style.display = 'none';
    }

    if (this.recent.length == 0){
      // @ts-ignore
      this.recent.push([name, document.getElementById('audio').getAttribute('src')]);
      RadioComponent.setLocal(name + '-recent', url);
    }
    else {
      let exist = false;
      for (let i of this.recent){

        if (i[0] == name){
          exist = true;

        }
      }
      if (exist == false) {
        if (this.recent.length < this.recentMax ){
          // @ts-ignore
          this.recent.push([name, document.getElementById('audio').getAttribute('src')]);
          RadioComponent.setLocal(name + '-recent', url);
        }
        else {
          RadioComponent.setLocal(name + '-recent', url);
          this.cookieService.set('-recent', this.recent[0]);
          let supp = this.recent[0][0];
          this.deleteLocal(supp + '-recent');
          this.recent.shift();
          // @ts-ignore
          this.recent.push([name, document.getElementById('audio').getAttribute('src')]);
        }
      }
    }
  }

  getRadio(){
    const res = this.http.get(this.link)
      .subscribe(result => {
        // @ts-ignore
        for (let i of result){
          // @ts-ignore
          this.radios.push([i.name, i.url]);
        }
      });
  }

  setSessionRecent(){
    for (let i of this.radios){
      if (this.getLocal(i[0] + '-recent')){
        // @ts-ignore
        this.recent.push([i[0],i[1]]);

      }
    }
    let surplus = this.recent.length - 5;
    this.recent.splice(4, surplus);
    this.setFav();
  }

  setFav(){
    for (let i of this.radios){
      if (this.getLocal(i[0] + '-fav')){
        // @ts-ignore
        this.fav.push([i[0],i[1] ]);
      }
    }
  }

  play(){
    // @ts-ignore
    document.getElementById('audio').play();
    // @ts-ignore
    document.getElementById('pause').style.display = 'flex';
    // @ts-ignore
    document.getElementById('play').style.display = 'none';
  }

  pause() {
    // @ts-ignore
    document.getElementById('audio').pause();
    // @ts-ignore
    document.getElementById('play').style.display = 'flex';
    // @ts-ignore
    document.getElementById('pause').style.display = 'none';
  }

  addFav(name: any){
    let exist = false;
    let url ;
    for(let i of this.radios){
      if (i[0] == name) {
        url = i[1];
      }
    }
    // @ts-ignore
    for (let i of this.fav){
      if (i[0] == name){
        exist = true;
        const index = this.fav.indexOf(i);
        let x = this.fav.splice(index, 1 );
        this.deleteLocal(name + '-fav');
        // @ts-ignore
        document.getElementById('fav-icon').style.display = 'flex';
        // @ts-ignore
        document.getElementById('fav-icon-full').style.display = 'none';
      }
    }
    if(!exist){
      RadioComponent.setLocal(name + '-fav', url);
      // @ts-ignore
      this.fav.push([name, url]);
      // @ts-ignore
      document.getElementById('fav-icon-full').style.display = 'flex';
      // @ts-ignore
      document.getElementById('fav-icon').style.display = 'none';
    }
  }

  seeSection(){
    // @ts-ignore
    if (document.getElementById('section').style.display == 'none') {
      // @ts-ignore
      document.getElementById('section').style.display='block';
    }
    else {
      // @ts-ignore
      document.getElementById('section').style.display='none';
    }
  }


  changeSection(sectionName: string){

    if(sectionName == 'radiolist'){
      // @ts-ignore
      document.getElementById('radiolist').style.display = 'block';
      // @ts-ignore
      document.getElementById('recent').style.display = 'none';
      // @ts-ignore
      document.getElementById('favoris').style.display = 'none';
    }

    if(sectionName == 'recent'){
      // @ts-ignore
      document.getElementById('radiolist').style.display = 'none';
      // @ts-ignore
      document.getElementById('recent').style.display = 'block';
      // @ts-ignore
      document.getElementById('favoris').style.display = 'none';
    }


    if(sectionName == 'favoris'){
      // @ts-ignore
      document.getElementById('radiolist').style.display = 'none';
      // @ts-ignore
      document.getElementById('recent').style.display = 'none';
      // @ts-ignore
      document.getElementById('favoris').style.display = 'block';
    }
  }

  ngOnInit(): void {
    this.getRadio();
    this.setSessionRecent();
  }

}
