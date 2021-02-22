import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-channels',
  templateUrl: './add-channels.component.html',
  styleUrls: ['./add-channels.component.css']
})
export class AddChannelsComponent implements OnInit {


  name = '';
  url = '';
  type = '';

  form: any;

  constructor(private http: HttpClient,private formBuilder: FormBuilder, private router: Router) {
    this.form = this.formBuilder.group({
      name: '',
      url: '',
      type: ''
    });
  }

  addRadio(res: { name: any; url: any; type: any; }){
    const headers = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');

    this.http.post('http://localhost:8888/newChannel', '',{
      headers,
      params: {
        name : res.name,
        url : res.url,
        type : res.type
      },
      responseType : 'json',
    }).subscribe( result => {
      if (result) {
       console.log('success');
        this.router.navigate(['/admin']);
      }
    });

  }

  ngOnInit(): void {
  }

}
