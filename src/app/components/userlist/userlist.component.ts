import { Component } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-userlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.scss',
})
export class UserlistComponent {
  users?: User[];
  userName = '';
  submitted = false;
  selectedUser: any = null;
  message = 'Pending Action..';
  form: FormGroup = new FormGroup({
    userName: new FormControl(''),
    email: new FormControl(''),
  });

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.getUsers();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    } else if (this.selectedUser === null) {
      const data = this.form.value;
      this.userService.create(data).subscribe({
        next: (res) => {
          this.refreshList();
          this.onReset();
          this.submitted = true;
          this.message = res.message
            ? res.message
            : 'Successfully created user!';
        },
        error: (e) => console.error(e),
      });
    } else if (this.selectedUser !== null) {
      this.userService.update(this.selectedUser.id, this.form.value).subscribe({
        next: (res) => {
          this.refreshList();
          this.onReset();
          this.selectedUser = null;
          this.message = res.message
            ? res.message
            : 'Successfully updated user!';
        },
        error: (e) => console.error(e),
      });
    }
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }

  getUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (e) => console.error(e),
    });
  }

  refreshList(): void {
    this.getUsers();
  }

  searchUsername(): void {
    this.userService.findByUsername(this.userName).subscribe({
      next: (data) => {
        this.users = data;
        this.message = `Searched user with "${this.userName}".`
      },
      error: (e) => console.error(e),
    });
  }

  resetSearch(): void {
    this.userName = '';
    this.message = 'Viewing all users.'
    this.refreshList();
  }

  getUserDtl(item: any): void {
    this.message = 'Editing user.';
    this.selectedUser = item;
    this.form.patchValue({
      userName: item.userName,
      email: item.email,
    });
  }

  deleteUser(item: any): void {
    this.userService.delete(item.id).subscribe({
      next: (res) => {
        this.message = res.message ? res.message : 'Successfully deleted user!';
        this.refreshList();
      },
      error: (e) => console.error(e),
    });
  }
}
