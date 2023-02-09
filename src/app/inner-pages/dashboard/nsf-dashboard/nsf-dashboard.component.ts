import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUserCredentials, StorageService } from 'src/app/_common/services/storage.service';
import { AddModalWindowComponent } from 'src/app/_common/modal-windows/add-modal-window/add-modal-window.component';
import { DO } from './user-info-array';
import { CommonFormsService } from 'src/app/_common/services/actc-forms-service/common-forms.service';
import { Subject, takeUntil } from 'rxjs';
import { AlertService } from 'src/app/_common/services/alert.service';
@Component({
  selector: 'app-nsf',
  templateUrl: './nsf-dashboard.component.html',
  styleUrls: ['./nsf-dashboard.component.scss'],
  // host: {
  //   "(window:click)": "onClick()"
  // }

})
export class NsfDashboardComponent implements OnInit {

  showOptionNSF: boolean = false;
  showOptionDO: boolean = false;
  loginUserData: any;
  role_name: string = '';
  userDetail!: IUserCredentials<any>
  linksForDO = DO;
  unsubscribe: Subject<any> = new Subject;
  showLoader: boolean = false;
  financialYear!: string;

  constructor(private _router: Router, private eRef: ElementRef, private _localStorage: StorageService, private modalService: NgbModal, private _commonApi: CommonFormsService,
    private _alert: AlertService) {
    this.loginUserData = this._localStorage.getUserData()
  }

  @HostListener('document:click', ['$event']) OnClick() {
    console.log("Mouse is clicked outside");
  }

  ngOnInit() {
    this.userDetail = this._localStorage.GetUserAllCredentials()
    this.role_name = this.userDetail.role_name
  }

  ManageACTC() {
    this._router.navigate(['manage-actc/list'])
  }

  clickOut(event: any) {
    if (event.target.id != 'dropdownList') this.showOptionNSF = true;
  }

  getCurrentFinancialYear() {
    var today = new Date();
    var curMonth = today.getMonth();
    var fiscalYr = "";
    if (curMonth > 3) {
      var nextYr1 = (today.getFullYear() + 2).toString();
      fiscalYr = (today.getFullYear() + 1).toString() + "-" + nextYr1;
    } else {
      var nextYr2 = (today.getFullYear() + 1).toString();
      fiscalYr = (today.getFullYear()).toString() + "-" + nextYr2;
    }
    this.financialYear = fiscalYr;
    return this.financialYear.substring(0, 4)
  }

  NavigateToFormA() {
    this.showLoader = true;
    let currentFinTear = this.getCurrentFinancialYear();
    this._commonApi.GetACTCList(this.loginUserData.role_id, this.loginUserData.user_id).pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (response: Array<any>) => {
        this.showLoader = false;
        let yearsArr: Array<any> = [];
        response.forEach((data: any) => {
          if (data.financialYear == currentFinTear) yearsArr.push(data);
        });
        (yearsArr.length <= 0) ? this._alert.ShowWarning('DO has not enabled ACTC form for this year yet', 0, 'Please contact your DO', true, 'OK') : this._router.navigate(['/actc-forms', currentFinTear]);
      }
    })
  }

  isShow() {
    if (this.loginUserData?.role_name == 'NSF') {
      this.showOptionNSF = !this.showOptionNSF;
    } else {
      this.showOptionDO = !this.showOptionDO;
    }
  }
  clickedOutside() {
    this.showOptionNSF = false;
    this.showOptionDO = false;
  }

  CheckUrlAndNavigate(data: string) {
    if (data == '') return
    else if (data == 'EAS') this.submissionForNSF()
    else this._router.navigate([data])
  }


  submissionForNSF() {
    this.modalService.open(AddModalWindowComponent, { size: 'lg', centered: true, backdrop: 'static', keyboard: false, });
  }

  ngOnDestroy() {
    this.unsubscribe.next(1);
    this.unsubscribe.complete();
  }
}
