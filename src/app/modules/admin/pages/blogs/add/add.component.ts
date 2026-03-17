import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Blog } from "../blogs.types";
import { BlogsService} from "../blogs.service";
import { AuthService } from "app/core/auth/auth.service";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { Observable, Observer } from "rxjs";
import {map, startWith} from 'rxjs/operators';
import { MatChipInputEvent } from "@angular/material/chips";
import * as moment from 'moment';

@Component({
  selector: "blogs-add",
  templateUrl: "./add.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogsAddComponent implements OnInit, OnDestroy {
  drawerOpened: boolean = true;
  drawerMode: "over" | "side" = "side";
  composeForm: FormGroup;
  filteredTags: Observable<string[]>;
  selectedTags: any[] = [];
  tags:string[];
  tagNew = new FormControl();
  loadingAction:boolean = false;
  copyFields: { cc: boolean; bcc: boolean } = {
    cc: false,
    bcc: false,
  };
  preview:boolean = false;
  quillModules: any = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["clean"], // remove formatting button
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme

      [{ align: [] }],

      ["link", "image", "video"], // link and image, video
    ],
  };

  quillFeatureImageModules: any = {
    toolbar: [
      ["image"], // link and image, video
    ],
  };

  blog: any = {};
  blogData:any = {};

  steps: any = [
    {
      name: "Title words should be 8 - 12",
      current: 0,
      status: "passed",
    },
    {
      name: "Content words should be > 800",
      current: 0,
      status: "passed",
    },
    {
      name: "Images should be at least 2",
      current: 0,
      status: "passed",
    },
    {
      name: "Headings should be at least 2",
      current: 0,
      status: "passed",
    },
    {
      name: "Subheadings should be at least 1",
      current: 0,
      status: "passed",
    },
    {
      name: "Tags should be at least 2",
      current: 0,
      status: "passed",
    },
    {
      name: "Internal links should be > 1",
      current: 0,
      status: "passed",
    },
  ];
  blogId: string = undefined;
  loading:boolean = false;
  userInfo: any;
  loadingDrafts:boolean = false;
  selectable = true;
  removable = true;
  addOnBlur = true;
  
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  private tagInput: ElementRef;

  @ViewChild('tagInput') set content(content: ElementRef) {
     if(content) { // initially setter gets called with undefined
         this.tagInput = content;
     }
  }

  

  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private blogService:BlogsService,
    private _router: Router,
    private auth: AuthService,
    private ref: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private cdr: ChangeDetectorRef

  ) {
    var snapshot = route.snapshot;

    let currentRoute = snapshot;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    let id = currentRoute.paramMap.get("id");

    // Make sure there is no 'id' parameter on the current route
    if (!id) {
        this.blogId = undefined;
        this.loading = false;
    }else if(id && id == 'newblog'){
        this.blogId = undefined;
        this.loading = false;
    } else if(id && id !== 'newblog') {
        this.blogId = id;
        this.preview = true;
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    this.userInfo = JSON.parse(this.auth.user);

    this.composeForm = this._formBuilder.group({
      title_name: ["", [Validators.required]],
      categoryid:["", [Validators.required]],
      description_name: ["", [Validators.required]],
      thumbnail_imag: ["", [Validators.required]],
      feature_text:["", [Validators.required]],
      imgsource_name : [""]
    });

    this.getTags();

    if(this.blogId) {
        this.getBlogDetails();
    }

   
  }



  /**
   * On destroy
   */
  ngOnDestroy(): void {}

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Show the copy field with the given field name
   *
   * @param name
   */
  showCopyField(name: string): void {
    // Return if the name is not one of the available names
    if (name !== "cc" && name !== "bcc") {
      return;
    }

    // Show the field
    this.copyFields[name] = true;
  }

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
  
    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }
  
  
  /* Method to fetch image from Url */
  getBase64ImageFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }
  base64DefaultURL:any;

  /* Method to create base64Data Url from fetched image */
  getBase64Image(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    return canvas.toDataURL("image/png");

  }
  

  updateFormValues() {

    // Patch values to the form
    this.composeForm.patchValue({
      title_name: this.blogData ? this.blogData.title : '',
      categoryid: this.blogData.category_id ? this.blogData.category_id : '',
      description_name: this.blogData.description ? this.blogData.description: '',
      feature_text: this.blogData.feature_text ? this.blogData.feature_text : '',
      imgsource_name :this.blogData.img_source_name ? this.blogData.img_source_name :''
    });


    if(this.blogData.featureimg_folderpath && this.blogData.featureimg_filename) {
      this.getBase64ImageFromURL( `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${this.blogData.featureimg_folderpath}/${this.blogData.featureimg_filename}`).subscribe((base64Data: string) => {
        this.composeForm.controls.thumbnail_imag.setValue(`<img src="${base64Data}"/>`);
        this.cdr.detectChanges();
      });
    }
  

  }

/**
   * get the blog details and update form field
   *
   * @param name
   */
 getBlogDetails(): void {
   this.loading = true;
    this.blogService.getBlogById(this.blogId)
    .subscribe(
        (res: any) => {
          this.loading = false;

          if(res.data && res.isSuccess) {
            this.blogData = res.data;
            this.blog = {
              'title_name': res.data.title,
              'description_name': res.data.description,
              'feature_text': res.data.feature_text,
              'img' : `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data.featureimg_folderpath}/${res.data.featureimg_filename}`

            }
            if(res.data.category_id) {

              this.selectedTags = [{
                category_id: res.data.category_id,
                category_name: res.data.category
              }];

            }
            this.updateFormValues();
          } 
          this.ref.detectChanges(); 
        },
        (error: any) => {
          this.loading = false;
          console.warn("error", error);
        }
      );
  }


  /**
   * Save and close
   */
  saveAndClose(): void {
    // Save the message as a draft
    this.saveAsDraft();

    // Close the dialog
    // this.matDialogRef.close();
  }

  /**
   * Discard the message
   */
  discard(): void {
    if (this.blogId) {
      const confirmation = this._fuseConfirmationService.open({
        title: '',
        message: 'Are you sure you want to archive? This action cannot be undone!',
        actions: {
          confirm: {
            label: 'Archive',
          },
        },
      });
  
      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          this.blogService.deleteBlog(this.blogId).subscribe(
            (res: any) => {
      
      
              this.loadingAction = false;
      
              this._router.navigate(['../'], {relativeTo : this.route});
      
      
            },
            (error: any) => {
              this.loadingAction = false;
              console.warn("error", error);
            }
          );
        }
      });
    }else {
      this._router.navigate(['../'], {relativeTo : this.route});
    }
  }

  /**
   * Save the message as a draft
   */
  saveAsDraft(): void {}

  /**
   * Send the message
   */
  send(isPublished:boolean): void {

    if (isPublished) {
      this.loadingAction = true;
    }else {
      this.loadingDrafts = true;
    }

    let photoObj:any = {};
    let regex = /<img.*?src="(.*?)"/;
    
    let img = regex.exec(this.composeForm.get("thumbnail_imag").value);
    
    if (img && img[1]) {
     
     photoObj = {
      "patientreportid": this.blogData && this.blogData.media_id ? this.blogData.media_id : 0,
      "filename": `${moment().format('DDMMYYYYhhmmss')}.jpeg`,
      "mimetype": 'image/jpeg',
      "fileBase64":  img[1].split(',')[1] 
     }

    }else {
      return;
    }

    const body = {
      articleid: this.blogId ? Number(this.blogId) : 0,
      title_name: this.composeForm.get("title_name").value,
      description_name: this.composeForm.get("description_name").value,
      categoryid: this.composeForm.get("categoryid").value,
      createdby: this.userInfo.user_id,
      "saveasdraft": !isPublished,
      "ispublished": isPublished,
      "featuretext": this.composeForm.get("feature_text").value,
      "imgsource_name": this.composeForm.get("imgsource_name").value,
      featuremedia : photoObj
    };
    this.blogService.createBlog(body).subscribe(
      (res: any) => {


        this.loadingAction = false;
        this.loadingDrafts = false;
 
        this._router.navigate(['../'], {relativeTo : this.route});


      },
      (error: any) => {
        this.loadingAction = false;
        this.loadingDrafts = false;

        console.warn("error", error);
      }
    );
  }


  saveTags(obj:any) {
    if(obj.categoryname) {
      this.blogService.addTags(obj)
      .subscribe(
          (res: any) => {            
            this.composeForm.controls.categoryid.setValue(res.data);

          },
          (error: any) => {
            console.warn("error", error);
          }
        );
        this.selectedTags = [{
          category_id: 0,
          category_name: obj.categoryname
        }];
    }
    
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;


    // Add our fruit
    if ((value || '').trim()) {

      const isOptionSelected = this.matAutocomplete.options.some(option => option.selected);

      if (!isOptionSelected) {
        let obj = {
          "categoryid": 0,
          "categoryname": event.value,      
        }
        this.saveTags(obj)
      }
    }

      // Reset the input value
       if (input) {
        input.value = '';
      }

       this.tagNew.setValue(null);
  }

  
  selected(event: MatAutocompleteSelectedEvent): void {
    event.option.deselect();
    this.composeForm.controls.categoryid.setValue(event.option.value['category_id']);
    this.selectedTags = [event.option.value];
    this.tagInput.nativeElement.value = '';

    // console.log(this.selectedTags);
    this.tagNew.setValue(null);

  }



  /**
   * view Blog 
   */
  previewDetails() : void {

    this.blog = {

      'title_name': this.composeForm.get("title_name").value,
      'description_name': this.composeForm.get("description_name").value,
      'img' : this.composeForm.get("thumbnail_imag").value

    };

    this.preview = !this.preview;

    
  }


  initFilters() {
    this.filteredTags = this.tagNew.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.tags.slice())),
    );
    console.log(this.filteredTags);
  }

  getTags():void {
    this.blogService.getTags()
    .subscribe(
        (res: any) => {
          this.loading = false;

          this.tags = res.data || [];
         this.initFilters();
        },
        (error: any) => {
          this.loading = false;
          console.warn("error", error);
        }
      );
  }

  /** check if argument value is a string */
  isString(value):boolean {
    return typeof value === 'string' || value instanceof String;
  }

  private _filter(value: any): string[] {

    if(this.isString(value)) {
      return this.tags.filter((fruit:any) => fruit.category_name.toLowerCase().includes(value.toLowerCase()));
    }
  }


  remove(tag:any, indx:number): void {
    this.selectedTags.splice(indx, 1);

    if(this.selectedTags && this.selectedTags.length == 0) {
      this.composeForm.controls.categoryid.setValue(null);
    }
  }
  
  addOnBlurMethos(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (!target || target.tagName !== 'MAT-OPTION') {
      const matChipEvent: MatChipInputEvent = {input: this.tagInput && this.tagInput.nativeElement, value : this.tagInput && this.tagInput.nativeElement.value};
      this.add(matChipEvent);
    }

  }



}
