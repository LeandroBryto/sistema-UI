import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EstudosService } from '../../services/estudos.service';
import { CertificadoResponseDTO } from '../../models/estudos.models';

@Component({
  selector: 'app-sistema-estudos-certificados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class CertificadosComponent implements OnInit {
  certificados: CertificadoResponseDTO[] = [];
  novoTitulo = '';
  arquivoSelecionado: File | null = null;
  loading = true;

  constructor(
    private estudosService: EstudosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarCertificados();
  }

  carregarCertificados(): void {
    this.loading = true;
    this.estudosService.getCertificados().subscribe({
      next: certificados => {
        this.certificados = certificados;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os certificados.'
        });
      }
    });
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file && file.type === 'application/pdf') {
      this.arquivoSelecionado = file;
    } else {
      this.arquivoSelecionado = null;
      this.messageService.add({
        severity: 'warn',
        summary: 'Arquivo inválido',
        detail: 'Selecione um arquivo PDF.'
      });
    }
  }

  uploadCertificado(): void {
    if (!this.novoTitulo.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Informe um título para o certificado.'
      });
      return;
    }

    if (!this.arquivoSelecionado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Selecione um arquivo PDF para enviar.'
      });
      return;
    }

    this.estudosService.uploadCertificado(this.novoTitulo, this.arquivoSelecionado).subscribe({
      next: certificado => {
        this.certificados.unshift(certificado);
        this.novoTitulo = '';
        this.arquivoSelecionado = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Certificado enviado com sucesso.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao enviar o certificado.'
        });
      }
    });
  }

  baixar(certificado: CertificadoResponseDTO): void {
    this.estudosService.downloadCertificado(certificado.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = certificado.nomeArquivo || `${certificado.titulo}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível baixar o certificado.'
        });
      }
    });
  }

  visualizar(certificado: CertificadoResponseDTO): void {
    this.estudosService.downloadCertificado(certificado.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível visualizar o certificado.'
        });
      }
    });
  }

  deletar(certificado: CertificadoResponseDTO): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o certificado "${certificado.titulo}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.estudosService.deletarCertificado(certificado.id).subscribe({
          next: () => {
            this.certificados = this.certificados.filter(c => c.id !== certificado.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Certificado excluído com sucesso.'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir o certificado.'
            });
          }
        });
      }
    });
  }
}

