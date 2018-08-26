import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response, Headers } from '@angular/http';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'ng-file-upload',
  template: `<div class="container-fluid">
  <div class="fileupload">
    <form [formGroup]="fileUploadForm">
      <div class=" form-group ">
        <input type="file" formControlName="fileUploadName" (change)="handleFilePreview($event.target.files)" multiple
          class="form-control ">
      </div>
    </form>
  </div>
  <div class="upld-btn">
      <button type="submit" class="btn btn-success fas fa-file-upload" (click)="uploadFiles()" [disabled]="disableUpload"> Upload</button>
    </div>
  <div class="preview_area">
    <div class="upload_items" *ngFor="let file of imagePreviewArray; let i = index">
      <div class="item-block">
        <img [src]="file.image" class="img-fluid" alt="img">
      </div>
      <div class="item-detail">
        <div class="float-left ">
          <h4>{{file.name}}</h4>
          <p>{{file.type}}</p>
          <p>{{file.size}}</p>
          <div class="success" *ngIf="file.file_status === 'completed'">Success , uploaded</div>
          <div *ngIf="file.file_status === 'failed'" class="error">OOps, failed</div>
        </div>
      </div>
      <div class="progress-status">
        <p>{{file.uploadProgress}} %</p>
      </div>
      <div class="action">
        <i *ngIf="(file.file_status !== 'completed')" [ngClass]="file.remove_icon" data-toggle="tooltip " (click)="removeFile(i, file.uploadProgress)" data-placement="top"
          title="remove"></i>
          <i *ngIf="(file.file_status === 'completed')" class="ok far fa-check-circle" data-toggle="tooltip " data-placement="top"title="success"></i>
      </div>
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" [style.width]="file.uploadProgress+ '%'"
          aria-valuenow="25" aria-valuemin="0 " aria-valuemax="100 "></div>
      </div>
    </div>
  </div>
</div>`,
  styleUrls: ['./ng-file-upload.component.css']
})
export class NgFileUploadComponent implements OnInit {
  public fileUploadForm: FormGroup;
  public file_count = 0;
  public fileUploadProgress = 0;
    public imagePreviewArray = [];
  public disableUpload = true;
  public showProgress = false;
  public fileToUpload;
  public finalFilesToPush;
  public uploadApi = 'http://localhost:8080/api/';  // `YOUR-API-HERE`

  constructor(
    public fb: FormBuilder,
    private _httpClient: HttpClient,
  ) {
  }

  ngOnInit() {
    this.fileUploadForm = this.fb.group({
      fileUploadName: ['']
    });
  }

  handleFilePreview(files) {
    // console.log(files);
    const file_types = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
    const imageDimensions = [];
    // validate file type and size
    // if (!(file_types.includes(files[i].type))) { alert('Please select valid filetype'); return false; }
    // if (files[i].size > 700000) { alert('file is too large'); return false; }

    for (let i = 0; i < files.length; i++) {
      const fileSize = this.bytesToSize(files[i].size);
      // Image Display
      const reader = new FileReader();
      reader.onload = (res: any) => {
        const finalGroupedFileData = {
          sno: i + 1,
          name: files[i].name,
          size: fileSize,
          type: files[i].type,
          image: (files[i].type.split('/')[0] === 'image') ?
            require('../../assets/image_icon.png') :
            require('../../assets/video_icon.png'),
          file: files[i],
          remove_icon: 'fa fa-trash ',
          uploadProgress: 0,
          file_status: 'pending' // processing , failed , completed
        };
        if (this.imagePreviewArray.length > 0) {
          // check if the same file is being added again
          for (let k = 0; k < this.imagePreviewArray.length; k++) {
            if (
              this.imagePreviewArray[k].name === finalGroupedFileData.name &&
              this.imagePreviewArray[k].size === finalGroupedFileData.size &&
              this.imagePreviewArray[k].type === finalGroupedFileData.type
            ) {
              alert('File already exist');
              return false;
            }
          }
        }
        this.imagePreviewArray.push(finalGroupedFileData);
        this.disableUpload = (this.imagePreviewArray.length > 0) ? false : true;
      };
      reader.readAsDataURL(files[i]);
      this.fileToUpload = {
        file: files[i]
      };
    }
  }

  removeFile(index, isProgress) {
    if (isProgress > 0) {
      this.imagePreviewArray[index].file_status = `failed`;
      if (this.imagePreviewArray.length === 0) {
      }
    } else {
      this.imagePreviewArray.splice(index, 1);
      this.disableUpload = (this.imagePreviewArray.length > 0) ? false : true;
      this.file_count = 0;
    }
  }

  bytesToSize = function (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) { return '0 Byte'; }
    const i = (Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  uploadFiles() {
    this.showProgress = true; // show progress
    this.disableUpload = true;

    const fileToUpload = this.imagePreviewArray;
    const formData: FormData = new FormData();

    formData.append('files', fileToUpload[this.file_count].file, fileToUpload[this.file_count].file.name);
    formData.append('file_title', fileToUpload[this.file_count].file.name);
    formData.append('file_size', fileToUpload[this.file_count].file.size);

    const req = new HttpRequest('POST', this.uploadApi + 'uploadFile', formData, {
      reportProgress: true,
    });
    const subs = this._httpClient.request(req).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.fileUploadProgress = Math.round(100 * event.loaded / event.total);
        this.imagePreviewArray[this.file_count].uploadProgress = this.fileUploadProgress;
        this.imagePreviewArray[this.file_count].file_status =
          (this.imagePreviewArray[this.file_count].file_status !== 'failed') ? `processing` : 'failed';

        // Check if the status of the file is failed , if so : unsubscribe the request and allow another request
        try {
          if (this.imagePreviewArray[this.file_count].file_status === 'failed') {
            throw new Error();
          }
        } catch (e) {
          subs.unsubscribe();
          this.imagePreviewArray.map((eFile, i) => {
            if (eFile.file_status === 'pending') {
              this.recursiveFileCall();
            }
          });
        }
        this.imagePreviewArray[this.file_count].file_status = (this.fileUploadProgress === 100) ? `completed` : `processing`;
      } else if (event instanceof HttpResponse) {
        this.imagePreviewArray[this.file_count].file_status = `completed`;
        this.recursiveFileCall();
      }
    });
  }


  recursiveFileCall() {
    if (this.imagePreviewArray.length !== this.file_count + 1) {
      this.file_count++;
      this.uploadFiles();
    } else {
      alert('upload complete');
      this.fileUploadForm.reset();
      this.imagePreviewArray = [];
    }
  }


}
