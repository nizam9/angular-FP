import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { NgFileUploadComponent } from './ng-file-upload/ng-file-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    NgFileUploadComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [ HttpClient ],
  bootstrap: [NgFileUploadComponent]
})
export class AppModule { }
