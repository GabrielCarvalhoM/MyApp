# F13 · Assinatura e paywall

**Situação:** NÃO INICIADO · bloqueado por decisão do fundador (#28: conta, assinatura de servidor, sincronização). Issue: #33.

**Objetivo.** Paywall e assinatura com StoreKit 2 conforme o Figma (tela 80), sem prometer o que o backend ainda não oferece.

**Possível sem backend.** Paywall com StoreKit 2 **local** (`.storekit` de teste), estados: carregando produtos · oferta · comprando · comprado ·
pendente (Ask to Buy) · falha · restaurar. Gate de acesso lido de `Transaction.currentEntitlements`.

**Depende do fundador.** Preços e política comercial (nunca definidos por agente) · validação de recibo no servidor · conta (#28) · bundle id
da loja (FDR/SEC).

**Testes.** Unit do ViewModel com `StoreKitTest`; XCUITest com configuração local. **Figma.** 80.

**Segurança.** Nenhuma credencial ou chave no repositório; nenhum dado de pagamento em log.
