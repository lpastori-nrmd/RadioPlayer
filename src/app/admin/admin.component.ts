import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  radios = [{name : '', url : '', type : ''}];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router ) { }

  link = 'http://localhost:8888/radio';

  getRadio(){
    const res = this.http.get(this.link)
      .subscribe(result => {
        // @ts-ignore
        for (let i of result){
          if (i == 0){
            this.radios[0] = {name : i.name, url : i.url, type : i.type};
          }
          this.radios.push({name : i.name, url : i.url, type : i.type});
        }
      });
  }

  deleteChannel(name: string){
    const res = this.http.delete(this.link +'/delete/' + name)
      .subscribe(result => {
        if (result){
          console.log('success');
          this.router.navigate(['admin']);
        }
      });
  }

  goto(name: any){
    this.router.navigate(['/editChannel', name]);
  }

  ngOnInit(): void {
    this.getRadio();
  }

}
