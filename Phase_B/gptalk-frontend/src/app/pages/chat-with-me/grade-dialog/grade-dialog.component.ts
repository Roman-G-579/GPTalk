import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Grade } from "../interfaces/grade.interface";

@Component({
  selector: 'app-grade-dialog',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './grade-dialog.component.html',
  styleUrl: './grade-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradeDialogComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  grade!: Grade;

  ngOnInit() {
    this.grade = this.config.data.grade;
  }
}
