# Founder request r2 — Map Share Privacy V1 · 2026-10-29

Current direct Founder request, given in the same Claude Code session on 2026-10-29, after the r1 record ([FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), [r1 bytes](r1/)). The State Model Consumer Closure was still open.
- **Decisor:** Founder.
- **Status:** DECIDED / CURRENT_PRODUCT_DECISION, formalized as PDR-1.11, DR-133 ([record](RECORD.md)).
- **Resolves:** the conflict recorded in r1 as GRW-04 (map/route vs DR-91, DR-109, L014).
- **Benchmarks named by the Founder:** Strava's current sharing and Map Visibility controls, and Runna's user-initiated external sharing. They are protection benchmarks, not templates, evidence or Product Truth. This record makes no claim about those products' current features.

The request is recorded verbatim below.

---

Nova decisão do Founder para a Growth Layer / Shareability.

Esta decisão resolve especificamente o conflito anteriormente registrado entre Map Share e DR-91/DR-109/L014.

Use como benchmark de proteção os controles atuais de compartilhamento/Map Visibility do Strava e o modelo user-initiated de compartilhamento externo de Runna.

DECISÃO:

Mapas reais passam a ser permitidos em shareables externos de atividades GPS na V1, desde que protegidos pela política abaixo.

MAP SHARE PRIVACY — V1

1. O compartilhamento de mapa é sempre iniciado explicitamente pelo usuário.

2. Para atividades GPS, os primeiros 200 metros e os últimos 200 metros da rota devem ficar ocultos por padrão no artefato compartilhável.

3. O usuário deve poder alterar a proteção para uma atividade individual antes de compartilhar.

4. Deve existir opção de ocultar completamente a rota/mapa do share.

5. O sistema deve oferecer pelo menos:
   - Map: mapa real + rota protegida;
   - Route: traçado da rota sem mapa;
   - Photo/Overlay;
   - share sem rota.

6. Antes do compartilhamento externo, o usuário deve visualizar exatamente o artefato final que será compartilhado.

7. A interface deve indicar de forma discreta que começo/fim estão protegidos e permitir editar essa configuração.

8. Raw GPS geometry nunca deve ser enviada como parte do mecanismo de image/social sharing.

O pipeline conceitual deve ser:

raw GPS
→ privacy filtering
→ share-safe geometry
→ map/artifact rendering
→ external share.

Ou seja, a proteção ocorre antes da geração do artefato externo.

9. Compartilhar um mapa não altera nem remove os dados completos da atividade privada do usuário.

10. Não existe compartilhamento automático.

11. Privacy Zones persistentes para locais sensíveis como Home/Work/custom location ficam previstas como evolução da proteção, mas não devem gerar infraestrutura prematura nesta missão. Avaliar com Security/Product antes de materializá-las, especialmente devido ao tratamento de localização precisa.

12. Esta decisão autoriza MAP BACKGROUND em shareables e supera a restrição anterior que limitava esse caso exclusivamente a route trace abstrato, somente dentro das condições de privacidade acima.

13. Ela NÃO autoriza:
- feed público;
- mapa social;
- localização em tempo real;
- exposição de residência;
- social graph;
- Crew;
- compartilhamento automático;
- exportação de GPS bruto.

Training/Safety/Privacy continuam prevalecendo sobre Growth.

Atualize o registro da Growth Layer no menor conjunto de autoridades aplicável, respeitando o estado da missão concorrente e o mecanismo de patch retido já estabelecido.

Se os arquivos protegidos pela State Model Consumer Closure ainda não puderem ser alterados, incorpore esta decisão ao mesmo mecanismo de sync retido, sem quebrar o baseline da missão concorrente.

Não aplique PENDING_CANON_SYNC.patch antes do gatilho já registrado.
