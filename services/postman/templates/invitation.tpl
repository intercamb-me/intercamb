{% extends "base.tpl" %}

{% block title %}{{ account.getFullName() }} convidou você para acessar o sistema de gestão de assessoria.{% endblock %}

{% block content %}
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td class="content-block">
      Para aceitar o convite e acessar o sistema de gestão de assessoria da empresa <b>{{ company.name }}</b>, basta clicar no botão abaixo e criar sua conta.
    </td>
  </tr>
  <tr>
    <td class="content-block align-center">
      <a class="btn-primary" href="https://intercamb.me/signup?invitation={{ invitation.id }}">
        Criar Conta
      </a>
    </td>
  </tr>
</table>
{% endblock %}