/* Celular do topo: protótipo do app GoGreen. Faz um tour sozinho pelas abas; quem toca numa aba
   vê a demonstração dela em loop, e o tour volta depois de 15 s sem toque. Dados de exemplo. */
(function(){
  var raiz=document.getElementById('fone');if(!raiz)return;
  var ft=raiz.querySelector('.ft'),leg=document.getElementById('fone-leg');
  var calmo=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ORDEM=['hoje','mes','eco','eu','ferr'];
  var estado={aba:null,tour:!calmo,ficha:0,visivel:true,somLigado:false,ocioso:null};

  /* ---------- som ---------- */
  var somGG=new Audio('fone/som-gogreen.mp3');somGG.preload='none';
  var ctx=null;
  function plim(){ // aviso curto do "app do banco", sintetizado
    try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();var t=ctx.currentTime;
      [880,1320].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+i*.12);g.gain.linearRampToValueAtTime(.18,t+i*.12+.01);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.25);
        o.connect(g);g.connect(ctx.destination);o.start(t+i*.12);o.stop(t+i*.12+.3)})}catch(e){}
  }
  function som(qual){if(!estado.somLigado)return;if(qual==='banco')plim();else{try{somGG.currentTime=0;somGG.play()}catch(e){}}}
  var bSom=document.getElementById('fone-som');
  if(bSom)bSom.addEventListener('click',function(){estado.somLigado=!estado.somLigado;bSom.setAttribute('aria-pressed',estado.somLigado);
    bSom.textContent=estado.somLigado?'🔊 Som ligado':'🔈 Ouvir os avisos';if(estado.somLigado){somGG.preload='auto';somGG.load()}});

  /* ---------- tempo ---------- */
  function Parou(){}
  function espera(ms,f){return new Promise(function(ok,nao){
    if(calmo)ms=0;var resta=ms,passo=100;
    (function tic(){if(f!==estado.ficha)return nao(new Parou());
      if(resta<=0)return ok();if(estado.visivel&&!document.hidden)resta-=passo;setTimeout(tic,passo)})()})}
  function legenda(t){if(leg)leg.textContent=t}

  /* ---------- peças ---------- */
  var $=function(s){return ft.querySelector(s)};
  function pag(id){return $('.ft-pag[data-p="'+id+'"]')}
  function item(ic,nome,linha,valor,extra){return '<div class="item'+(extra||'')+'"><span class="ic">'+ic+'</span><span class="tx"><b>'+nome+'</b><span>'+linha+'</span></span><span class="vl">'+valor+'</span></div>'}
  function aviso(ap,cor,app,titulo,texto){var h=$('.ft-hu');h.innerHTML='<div class="cab"><span class="ap" style="background:'+cor+'">'+ap+'</span>'+app+' · agora</div><b>'+titulo+'</b><p>'+texto+'</p>';h.classList.add('on')}
  function semAviso(){$('.ft-hu').classList.remove('on')}
  function snack(t){var s=$('.ft-snack');s.innerHTML=t;s.classList.add('on')}
  function semSnack(){$('.ft-snack').classList.remove('on')}
  function toque(el){if(!el||calmo)return;var r=el.getBoundingClientRect(),b=ft.getBoundingClientRect(),t=$('.ft-toque');
    t.style.left=(r.left-b.left+r.width/2)+'px';t.style.top=(r.top-b.top+r.height/2)+'px';t.classList.remove('on');void t.offsetWidth;t.classList.add('on');
    el.classList.remove('pulsa');void el.offsetWidth;el.classList.add('pulsa')}
  function rolar(p,em){var r=p.querySelector('.ft-rola');if(r)r.style.transform='translateY(-'+em+'em)'}
  var mesNome=(function(){try{var n=new Date().toLocaleDateString('pt-BR',{month:'long'});return n.charAt(0).toUpperCase()+n.slice(1)}catch(e){return 'Este mês'}})();
  var FOLHA=$('.ft-top svg.folha').outerHTML;

  /* ---------- telas ---------- */
  var TELAS={
    hoje:function(){return '<div class="ft-rola">'+
      '<div class="cd pri"><small style="color:inherit;opacity:.8">Cartão do dia</small><p><b>GoGreen Day:</b> vá ao mercado uma vez por semana, não todo dia. Cada visita é uma chance de impulso.</p></div>'+
      '<div class="cd"><small>🗓️ Dias seguidos no verde</small><p>Você está há <b>12 dias</b> no verde. Seu recorde: 12 dias.</p></div>'+
      '<div class="tit">Seus gastos</div><div class="lista">'+
      item('⛽','Posto Bom Caminho','App do banco · ontem 18:20<br>Combustível · Débito','R$ 150,00')+
      item('🛒','Mercado Bom Preço','App do banco · ter 19:05<br>Mercado/compras de casa · Crédito','R$ 86,40')+
      '</div></div>'},
    mes:function(){function c(n,v,t,p,cl){return '<div class="cat"><div class="l"><b>'+n+'</b><span>'+v+' de '+t+'</span></div><div class="barra"><i class="'+cl+'" data-w="'+p+'"></i></div></div>'}
      return '<div class="v-mes"><div class="ft-rola"><h4>‹ '+mesNome+' ›</h4>'+
      '<div class="cd"><p>Tudo sob controle, com atenção em algumas categorias.</p><small style="margin-top:.35em">Sobra real: R$ 812,00 (renda − gastos − contas fixas a sair)</small><span class="btn-ft lin-bt" data-b="conferir">📄 Conferir com extrato</span></div>'+
      c('Moradia','R$ 1.100','R$ 1.100',100,'')+
      c('Mercado/compras de casa','R$ 552,90','R$ 600',92,'am')+
      c('Alimentação fora','R$ 140','R$ 200',70,'')+
      c('Combustível','R$ 210','R$ 200',100,'vm')+
      c('Lazer/eventos','R$ 35','R$ 100',35,'')+
      c('Transporte por app','R$ 48','R$ 75',64,'')+'</div></div>'+
      '<div class="v-ext" hidden><p class="volta">‹ Fechar</p><h4>Conferir '+mesNome.toLowerCase()+'</h4><p class="passo"></p><div class="ext"></div></div>'},
    eco:function(){function f(e,t,p){return '<div class="fer" data-f="'+t+'"><em>'+e+'</em><b>'+t+'</b><span>'+p+'</span></div>'}
      return '<div class="v-grade"><h4>O que me ajuda a gastar menos?</h4><p class="sub">Cada ferramenta guarda o seu placar de dinheiro salvo.</p><div class="grade">'+
      f('🧮','Comparador de gôndola','Qual sai mais barato?')+f('🧊','Congelador','Preciso mesmo disso agora?')+
      f('🔎','Caçador de desperdício','Onde o dinheiro escapa?')+f('🥕','Dia da Catança','O que já tem em casa?')+
      f('🐷','Cofrinho','Quanto já guardei?')+f('💡','Minha dica','O que funciona para mim?')+'</div></div>'+
      '<div class="v-comp" hidden><p class="volta">‹ Economizar</p><h4>🧮 Comparador de gôndola</h4><p class="sub">Qual sai mais barato?</p>'+
      '<div class="op" data-o="a"><span><b>Opção A · Arroz 5 kg</b><span>R$ 27,90</span></span><span class="pr"><b>R$ 5,58</b><span>por kg</span></span></div>'+
      '<div class="op" data-o="b"><span><b>Opção B · Arroz 1 kg</b><span>R$ 6,49</span></span><span class="pr"><b>R$ 6,49</b><span>por kg</span></span></div>'+
      '<div class="cd pri res" style="opacity:0;transition:opacity .4s"><p><b>A sai 14% mais barato.</b> Levando 5 kg, ficam R$ 4,55 no seu bolso.</p></div></div>'+
      '<div class="v-gel" hidden><p class="volta">‹ Economizar</p><h4>🧊 Congelador</h4><p class="sub">Preciso mesmo disso agora?</p>'+
      '<div class="cd"><p>Bateu a vontade de comprar algo que não é essencial? Congela o gasto e espera. Quando descongelar, se ainda quiser, compre sem culpa. Se a vontade passar, deixe derreter: o dinheiro fica com você.</p></div>'+
      '<div class="gelo"><b>❄️ Tênis de corrida · R$ 349,90</b><span class="conta">Descongela em 2 dias e 23 h</span></div></div>'},
    eu:function(){function l(t,s){return '<div class="item" data-i="'+t+'"><span class="tx"><b>'+t+'</b><span>'+s+'</span></span></div>'}
      return '<div class="v-ini"><h4>Eu</h4><p class="sub">Como estou indo?</p>'+
      l('😊 GoGreen Ana!','Toque para trocar o apelido.')+l('🍃 Meu progresso · nível 4','Folhinhas, medalhas e desafios.')+
      l('🌱 Meu plano: Gratuito','O que o Pro libera, gerenciar a assinatura e restaurar compras.')+l('💵 Renda e tetos','Renda R$ 5.000,00')+
      l('👨‍👩‍👧 Minha família','Quem é importante para você. Os nomes aparecem no prêmio de fim de mês.')+
      l('📣 Convide amigos, ganhe Pro','Quem chega pelo seu link ganha 30 dias de Pro, e você também.')+'</div>'+
      '<div class="v-prog" hidden><p class="volta">‹ Eu</p><h4>🍃 Meu progresso</h4>'+
      '<div class="cd"><small>Nível 4 · 640 folhinhas</small><div class="barra"><i data-w="40"></i></div><small style="margin-top:.35em">Faltam 160 folhinhas para o nível 5.</small></div>'+
      '<div class="tit">Medalhas</div><div class="med"><span>👣 Primeiro passo</span><span>🌿 Semana verde</span><span>🎯 Desafiante</span><span class="off">🔥 30 dias no verde</span><span class="off">🏆 Mês no verde</span></div>'+
      '<div class="cd"><small>🎯 Desafio da semana · até domingo</small><p>Compare 3 produtos na gôndola.</p><div class="barra"><i data-w="66"></i></div></div>'+
      '<div class="cd"><small>🛡️ Guardião Vitalício</small><p>Meses seguidos no verde: 2 de 6</p><div class="barra"><i data-w="33"></i></div></div></div>'},
    ferr:function(){function l(ic,t,s){return '<div class="item" data-i="'+t+'"><span class="ic">'+ic+'</span><span class="tx"><b>'+t+'</b><span>'+s+'</span></span></div>'}
      return '<div class="ft-rola"><h4>Ferramentas</h4><p class="sub">Como configuro e cuido dos meus dados?</p>'+
      l('📲','Central de captura','Lendo 2 apps. Fontes, aprendizado e ignorados.')+
      l('🔔','Notificações e interações','Quanto eu falo com você: nível, dicas, horários de risco.')+
      l('🎨','Aparência','Paleta de cores, claro ou escuro e cards da tela Hoje.')+
      l('🏷️','Categorias','30 categorias. Criar, renomear, apagar e mudar o teto.')+
      l('📄','Exportar para a planilha','CSV no formato da aba “Lançamentos diários”.')+
      l('💾','Cópia de segurança','Salve tudo num arquivo e restaure em outro celular. Sem internet.')+
      l('🤝','Sem pegadinha','Os 7 compromissos: dados só no celular, nunca anúncio, nada de senha ou CPF.')+
      l('ℹ️','Sobre o GoGreen','Seus dados ficam só neste aparelho.')+'</div>'+
      '<div class="v-apa" hidden><p class="volta">‹ Ferramentas</p><h4>Aparência</h4><p class="sub">Escolha as cores do seu GoGreen. Muda na hora.</p>'+
      '<div class="tit">Paleta</div><div class="chips">'+
      [['auto','Automática','conic-gradient(#81C784 0 33%,#F2C04B 0 66%,#FFB59E 0)'],['verde','Verde GoGreen','#2E7D32'],['oceano','Oceano','#1565C0'],['sol','Pôr do sol','#C1502E'],['dourado','Dourado','#7A5900'],['lavanda','Lavanda','#6750A4'],['grafite','Grafite','#37474F']]
        .map(function(x){return '<span class="chip'+(x[0]==='verde'?' on':'')+'" data-pal="'+x[0]+'"><i style="background:'+x[2]+'"></i>'+x[1]+'</span>'}).join('')+'</div>'+
      '<div class="tit">Claro ou escuro</div><div class="chips"><span class="chip" data-modo="sis">Igual ao celular</span><span class="chip" data-modo="claro">Claro</span><span class="chip on" data-modo="escuro">Escuro</span></div>'+
      '<div class="tit">Cards da tela Hoje</div><div class="chips"><span class="chip on">Coloridos</span><span class="chip">Neutros</span></div>'+
      '<p class="sub nota-apa" style="margin-top:.7em"></p></div>'}
  };

  /* ---------- demonstrações ---------- */
  var CENAS={
    hoje:async function(f){var p=pag('hoje');
      legenda('Você paga do jeito de sempre. O GoGreen só observa o aviso do banco.');
      await espera(1600,f);
      aviso('🏦','#1565C0','App do banco','Compra aprovada','Cartão final 1234: R$ 42,90 em PADARIA PAO QUENTE');som('banco');
      legenda('O banco avisa a compra no celular, como sempre.');
      await espera(3000,f);semAviso();await espera(500,f);
      var l=p.querySelector('.lista');l.insertAdjacentHTML('afterbegin',item('🥖','Padaria Pão Quente','App do banco · agora<br>Mercado/compras de casa · Crédito','R$ 42,90',' novo'));
      snack('<span>Anotado em <em>Mercado/compras de casa</em></span><span>Desfazer</span>');
      legenda('O GoGreen lê o aviso e anota sozinho, na categoria certa. Sem internet.');
      await espera(3200,f);semSnack();await espera(900,f);
      aviso(FOLHA,'transparent','GoGreen','🟡 Mercado/compras de casa está chegando no teto','Já foram R$ 552,90 de R$ 600,00. Restam R$ 47,10 até o fim do mês. Dá para ir com calma nela daqui pra frente?');som('gg');
      ft.querySelector('.ft-nav [data-a="mes"] .ponto').classList.add('on');
      legenda('E avisa antes de você estourar o teto do mês.');
      await espera(5200,f);semAviso();await espera(1400,f)},
    mes:async function(f){var p=pag('mes');legenda('No Mês, cada categoria tem um teto e uma cor.');
      await espera(500,f);var bs=p.querySelectorAll('.barra i');
      for(var i=0;i<bs.length;i++){bs[i].style.width=bs[i].dataset.w+'%';await espera(260,f)}
      await espera(1800,f);legenda('Verde: tranquilo. Amarelo: passou de 90% do teto. Vermelho: passou do teto.');
      toque(p.querySelectorAll('.cat')[1]);await espera(2600,f);toque(p.querySelectorAll('.cat')[3]);
      await espera(2400,f);legenda('Contas fixas, como a moradia, ficam verdes até 100%. A sobra real já desconta o que ainda vai sair.');
      await espera(3800,f);await importar(p,f)},
    eco:async function(f){var p=pag('eco'),g=p.querySelector('.v-grade'),c=p.querySelector('.v-comp'),z=p.querySelector('.v-gel');
      legenda('Em Economizar ficam as ferramentas para gastar menos.');await espera(2200,f);
      toque(p.querySelector('[data-f="Comparador de gôndola"]'));await espera(900,f);g.hidden=true;c.hidden=false;
      legenda('Na gôndola, o comparador mostra qual sai mais barato de verdade.');await espera(1600,f);
      c.querySelector('[data-o="a"]').classList.add('ganha');c.querySelector('.res').style.opacity=1;await espera(3600,f);
      c.hidden=true;g.hidden=false;legenda('Bateu a vontade de comprar?');await espera(1000,f);
      toque(p.querySelector('[data-f="Congelador"]'));await espera(900,f);g.hidden=true;z.hidden=false;
      legenda('Congele a vontade antes de pagar. Se passar, o dinheiro fica com você.');
      var ct=z.querySelector('.conta'),h=71;for(var k=0;k<3;k++){await espera(1300,f);h--;ct.textContent='Descongela em 2 dias e '+(h-48)+' h'}
      await espera(1600,f)},
    eu:async function(f){var p=pag('eu'),a=p.querySelector('.v-ini'),b=p.querySelector('.v-prog');
      legenda('Em Eu você acompanha como está indo.');await espera(2200,f);
      toque(p.querySelector('[data-i="🍃 Meu progresso · nível 4"]'));await espera(900,f);a.hidden=true;b.hidden=false;
      legenda('Folhinhas, medalhas e desafios deixam o caminho mais leve.');
      var bs=b.querySelectorAll('.barra i');await espera(300,f);for(var i=0;i<bs.length;i++){bs[i].style.width=bs[i].dataset.w+'%';await espera(350,f)}
      await espera(2600,f);legenda('Seis meses seguidos no verde como assinante, mais os desafios, dão o Guardião Vitalício.');await espera(4200,f)},
    ferr:async function(f){var p=pag('ferr');legenda('Na engrenagem você cuida dos seus dados.');await espera(1800,f);
      toque(p.querySelector('[data-i="Central de captura"]'));legenda('Você escolhe quais apps de banco o GoGreen lê. O resto é ignorado.');await espera(3200,f);
      await aparencia(p,f);
      toque(p.querySelector('[data-i="Cópia de segurança"]'));legenda('Seus dados ficam só neste celular. A cópia de segurança é um arquivo seu.');await espera(3400,f);
      toque(p.querySelector('[data-i="Sem pegadinha"]'));legenda('Sem pegadinha: seus dados não saem do celular, sem anúncio, sem senha do banco.');await espera(3600,f)}
  };

  /* ---------- Aparência: a paleta muda o celular inteiro ---------- */
  function tema(t){if(t)ft.setAttribute('data-tema',t);else ft.removeAttribute('data-tema')}
  async function aparencia(p,f){var m=p.querySelector('.ft-rola'),a=p.querySelector('.v-apa'),nota=a.querySelector('.nota-apa');
    toque(p.querySelector('[data-i="Aparência"]'));await espera(900,f);m.hidden=true;a.hidden=false;
    legenda('Em Aparência você escolhe as cores do seu GoGreen. Muda na hora.');await espera(1800,f);
    function pal(k){a.querySelectorAll('[data-pal]').forEach(function(c){c.classList.toggle('on',c.dataset.pal===k)});toque(a.querySelector('[data-pal="'+k+'"]'))}
    function modo(k){a.querySelectorAll('[data-modo]').forEach(function(c){c.classList.toggle('on',c.dataset.modo===k)});toque(a.querySelector('[data-modo="'+k+'"]'))}
    pal('oceano');tema('oceano');legenda('Oceano: azuis calmos.');await espera(2200,f);
    pal('lavanda');tema('lavanda');legenda('Lavanda: lilás suave.');await espera(2200,f);
    pal('sol');tema('sol');legenda('Pôr do sol: coral e pêssego, quentinho.');await espera(2200,f);
    pal('verde');modo('claro');tema('claro');legenda('Claro ou escuro, como você preferir.');await espera(2600,f);
    modo('escuro');pal('auto');tema('dourado');nota.textContent='Muda com o seu mês: verde no verde, dourado na atenção, coral no aperto.';
    legenda('Na Automática, as cores acompanham o seu mês: dourado quando pede atenção.');await espera(3200,f);
    tema('');legenda('E verde quando o mês está no verde.');await espera(2200,f);
    a.hidden=true;m.hidden=false;await espera(600,f)}

  /* ---------- Conferir com extrato: 4 passos ---------- */
  var MM=('0'+(new Date().getMonth()+1)).slice(-2);
  async function importar(p,f){var vm=p.querySelector('.v-mes'),ve=p.querySelector('.v-ext'),ps=ve.querySelector('.passo'),ex=ve.querySelector('.ext');
    function passo(n,t,h){ps.textContent='Passo '+n+' de 4 · '+t;ex.innerHTML=h}
    var mesMin=mesNome.toLowerCase();
    rolar(p,0);toque(p.querySelector('[data-b="conferir"]'));legenda('No fim do mês, confira com o extrato do banco.');await espera(900,f);
    vm.hidden=true;ve.hidden=false;
    passo(1,'Banco e arquivo','<div class="tit">Qual é o banco?</div><div class="chips"><span class="chip">Itaú</span><span class="chip">BB</span><span class="chip on">Nubank</span><span class="chip">Santander</span><span class="chip">Outro</span></div>'+
      '<span class="btn-ft" data-b="arq">Escolher o arquivo (PDF, CSV ou OFX)</span><p class="sub">O arquivo é lido aqui no celular e não fica guardado. Do PDF eu pego só a data, a descrição e o valor: nome, CPF, agência e conta ficam de fora.</p>');
    legenda('Escolha o banco e o arquivo: PDF, CSV ou OFX. Tudo é lido aqui no celular.');await espera(3000,f);
    toque(ex.querySelector('[data-b="arq"]'));await espera(700,f);
    ex.querySelector('[data-b="arq"]').innerHTML='<span class="gira"></span> Lendo o arquivo…';await espera(1500,f);
    passo(2,'Período','<div class="cd"><p>O arquivo vai de 1º a 30 de '+mesMin+', com 28 lançamentos.</p><small style="margin-top:.3em">A soma bate com o total do banco. 🌿</small></div>'+
      '<div class="tit">Que período você quer conferir?</div><div class="chips col"><span class="chip">O arquivo todo</span><span class="chip on">Só '+mesMin+' (o mês desta tela)</span><span class="chip">Escolher as datas</span></div>'+
      '<span class="btn-ft" data-b="prev">Ver a prévia (28)</span>');
    legenda('Ele separa o período e confere se a soma bate com o total do banco.');await espera(3200,f);
    toque(ex.querySelector('[data-b="prev"]'));await espera(800,f);
    function ln(d,t,v){return '<div class="lin"><span class="chk">☑</span><span>'+d+'/'+MM+'</span><b>'+t+'</b><span>'+v+'</span></div>'}
    passo(3,'Prévia','<p class="sub">Confira o que eu li. Desmarque o que não quer conferir e toque numa linha para corrigir.</p>'+
      ln('03','PADARIA PAO QUENTE','R$ 42,90')+ln('05','POSTO BOM CAMINHO','R$ 150,00')+ln('08','FARMACIA VIDA','R$ 37,80')+ln('09','STREAMING PLUS','R$ 39,90')+ln('12','FEIRA DO BAIRRO','R$ 64,00')+
      '<span class="btn-ft" data-b="conf">Conferir com o app (28)</span>');
    legenda('Você vê a prévia do que ele leu e corrige o que precisar.');await espera(3200,f);
    toque(ex.querySelector('[data-b="conf"]'));await espera(800,f);
    passo(4,'Conferir','<div class="cd"><p>25 já estão no app. Faltam 3 no app.</p></div><div class="tit">Está no extrato e falta no app</div>'+
      '<div class="lin"><b>FARMACIA VIDA</b><span>08/'+MM+' · R$ 37,80</span></div><div class="lin"><b>STREAMING PLUS</b><span>09/'+MM+' · R$ 39,90</span></div><div class="lin"><b>FEIRA DO BAIRRO</b><span>12/'+MM+' · R$ 64,00</span></div>'+
      '<span class="btn-ft" data-b="imp">Importar os 3 que faltam</span><p class="sub">Entram anotados, na categoria que eu sugerir. Dá para mudar tocando neles depois.</p>');
    legenda('Ele mostra o que o banco tem e o app não tem.');await espera(3000,f);
    toque(ex.querySelector('[data-b="imp"]'));await espera(800,f);
    ps.textContent='';ex.innerHTML='<div class="cd pri"><p><b>Importação concluída</b></p><p>3 lançamentos importados · 25 gastos batem</p></div><span class="btn-ft" data-b="ok">Marcar '+mesMin+' como conferido</span>';
    legenda('O que faltou entra com um toque, sem digitar nada.');await espera(2200,f);
    toque(ex.querySelector('[data-b="ok"]'));await espera(700,f);
    ex.querySelector('[data-b="ok"]').outerHTML='<p class="sub" style="color:var(--pri);font-weight:700">✓ Conferido com o extrato</p>';
    legenda('Mês conferido. O arquivo não fica guardado no celular.');await espera(2600,f)}

  /* ---------- navegação ---------- */
  function mostrar(aba){
    estado.aba=aba;estado.ficha++;var f=estado.ficha;semAviso();semSnack();tema('');
    ft.querySelectorAll('.ft-pag').forEach(function(x){var on=x.dataset.p===aba;x.classList.toggle('on',on);if(on)x.innerHTML=TELAS[aba]()});
    ft.querySelectorAll('.ft-nav button').forEach(function(b){var on=b.dataset.a===aba;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});
    var e=$('.ft-eng');e.classList.toggle('on',aba==='ferr');$('.ft-fab').style.display=aba==='ferr'?'none':'';
    if(aba==='hoje')ft.querySelector('.ft-nav [data-a="mes"] .ponto').classList.remove('on');
    rodar(aba,f)}
  async function rodar(aba,f){
    try{await CENAS[aba](f);
      if(calmo)return;
      if(estado.tour){var i=(ORDEM.indexOf(aba)+1)%ORDEM.length;mostrar(ORDEM[i])}
      else{await espera(1500,f);mostrar(aba)}
    }catch(e){if(!(e instanceof Parou))throw e}}
  function tocou(aba){estado.tour=false;mostrar(aba);clearTimeout(estado.ocioso);
    if(!calmo)estado.ocioso=setTimeout(function(){estado.tour=true},15000)}
  ft.querySelectorAll('.ft-nav button').forEach(function(b){b.addEventListener('click',function(){tocou(b.dataset.a)})});
  $('.ft-eng').addEventListener('click',function(){tocou(estado.aba==='ferr'?'hoje':'ferr')});

  if('IntersectionObserver' in window)new IntersectionObserver(function(es){estado.visivel=es[0].isIntersecting},{threshold:.2}).observe(raiz);
  mostrar('hoje');
})();
