#!/usr/bin/env bash
# Testa a API (Node ou PHP) de ponta a ponta.  Uso: bash tools/test-api.sh http://localhost:8080
set -u
B="${1:-http://localhost:8080}"
PW=$(grep '^ADMIN_PASSWORD=' "$(dirname "$0")/../.env" | cut -d= -f2-)
J=$(mktemp); ok=0; bad=0
check() { if [ "$2" = "$3" ]; then echo "  ✅ $1"; ok=$((ok+1)); else echo "  ❌ $1 — esperado $3, veio $2"; bad=$((bad+1)); fi; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "API em $B"
check "público responde"            "$(code $B/api/public)" 200
check "sabores no público"          "$(curl -s $B/api/public | grep -o '"id":"marguerita"' | head -1)" '"id":"marguerita"'
check "admin sem login = 401"       "$(code $B/api/admin/data)" 401
check "form (não JSON) = 415"       "$(code -X POST -d 'x=1' $B/api/orders)" 415
check "senha errada = 401"          "$(code -X POST -H 'Content-Type: application/json' -d '{"password":"errada123"}' $B/api/login)" 401
check "login certo = 200"           "$(code -c "$J" -X POST -H 'Content-Type: application/json' -d "{\"password\":\"$PW\"}" $B/api/login)" 200
check "me = admin"                  "$(curl -s -b "$J" $B/api/me)" '{"admin":true}'
check "admin/data com login"        "$(code -b "$J" $B/api/admin/data)" 200
check "pedido sem endereço = 400"   "$(code -X POST -H 'Content-Type: application/json' -d '{"items":[{"id":"marguerita","qty":1}],"customer":{"name":"Teste","phone":"33999990000"},"delivery":"entrega","address":{}}' $B/api/orders)" 400
R=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"items":[{"id":"marguerita","qty":2},{"id":"nao-existe","qty":5}],"customer":{"name":"Teste API","phone":"33999990000"},"delivery":"retirada"}' $B/api/orders)
N=$(echo "$R" | grep -o '"number":[0-9]*' | cut -d: -f2)
check "pedido válido gera número"   "$([ -n "$N" ] && echo sim)" sim
check "total = 2 × 10,99"           "$(echo "$R" | grep -o '"total":[0-9.]*' | cut -d: -f2)" 21.98
check "pedido aparece no painel"    "$(curl -s -b "$J" $B/api/admin/orders | grep -c "\"number\":$N")" 1
check "muda status"                 "$(curl -s -b "$J" -X PATCH -H 'Content-Type: application/json' -d '{"status":"preparo"}' $B/api/admin/orders/$N | grep -o '"status":"preparo"' | head -1)" '"status":"preparo"'
check "status inválido = 400"       "$(code -b "$J" -X PATCH -H 'Content-Type: application/json' -d '{"status":"xx"}' $B/api/admin/orders/$N)" 400
check "apaga pedido de teste"       "$(code -b "$J" -X DELETE $B/api/admin/orders/$N)" 200
check "link e-book inválido vira vazio" "$(curl -s -b "$J" $B/api/admin/data | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const o=JSON.parse(s);o.settings.ebookLink='javascript:alert(1)';process.stdout.write(JSON.stringify(o.settings))})" | curl -s -b "$J" -X PUT -H 'Content-Type: application/json' --data-binary @- $B/api/admin/settings | grep -o '"ebookLink":""')" '"ebookLink":""'
check "ingrediente inválido removido" "$(curl -s -b "$J" $B/api/admin/data | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const o=JSON.parse(s);o.flavors[0].toppings.push({k:'hack',n:3});process.stdout.write(JSON.stringify(o.flavors))})" | curl -s -b "$J" -X PUT -H 'Content-Type: application/json' --data-binary @- $B/api/admin/flavors | grep -c '"hack"')" 0
check "logout"                      "$(code -b "$J" -c "$J" -X POST -H 'Content-Type: application/json' -d '{}' $B/api/logout)" 200
check "após logout = 401"           "$(code -b "$J" $B/api/admin/data)" 401
rm -f "$J"
echo "Resultado: $ok ok, $bad falhas"
[ $bad -eq 0 ]
