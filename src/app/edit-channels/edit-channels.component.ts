import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-edit-channels',
  templateUrl: './edit-channels.component.html',
  styleUrls: ['./edit-channels.component.css']
})
export class EditChannelsComponent implements OnInit {

  form: any;
  name ='';
  radio = {name : '', url:'', type:'', id:''};
  link = 'http://localhost:8888/radio/';

  constructor(private http: HttpClient, private route: ActivatedRoute ,private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: '',
      url: '',
      type: '',
      id : ''
    });
  }

  ngOnInit(): void {
    // @ts-ignore
    this.name = this.route.snapshot.paramMap.get('name');
    this.getActualRadio();
  }

  getActualRadio(){
    const res = this.http.get(this.link + this.name )
      .subscribe(result => {
        // @ts-ignore
        for (let i of result){
          // @ts-ignore
          this.radio['name']= i.name;
          this.radio['url']= i.url;
          this.radio['type']= i.type;
          this.radio['id']= i.id;
        }
      });
  }

  // @ts-ignore
  modifyRadio(res: { name: any; url: any; type: any; id: any }){
    const headers = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');

    res.id = this.radio.id;
    if(res.name == ''){
      res.name = this.radio.name;
    }
    if(res.url == ''){
      res.url = this.radio.url;
    }
    if(res.type == ''){
      res.type = this.radio.type;
    }

    this.http.put('http://localhost:8888/modifyChannel', '',{
      headers,
      params: {
        name : res.name,
        url : res.url,
        type : res.type,
        id : res.id
      },
      responseType : 'json',
    }).subscribe( result => {
      if (result) {
      }
    });
  }

  test(){
    console.log(this.radio);
    // @ts-ignore
    document.getElementById('name').setAttribute('value', this.radio.name)
  }
}
