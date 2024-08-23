# Dobrar & Assoprar
> O jogo de corrida de barcos de papel

# Compilar e executar:

> Para compilar digite o seguinte comando
```
npm install
```

> Para executar o servidor
```
node index.js
```

- E para abrir o jogo, basta acessar o home.html no seu navegador
- Bom jogo!

# Documento de Design do Jogo

> Para melhores soluções, vamos nos concentrar em responder algumas perguntas sobre isso...

1. Como o jogo funciona?

- Cada usuário pode criar uma sala e entrar em qualquer sala (assumindo que todas estejam desbloqueadas).
- Quando 4 pessoas se reúnem em uma sala, podem iniciar a partida.
- Na partida, o vencedor é quem termina a corrida primeiro.
- Na corrida, há 2 etapas:
    1. Dobrar seu barco de papel.
    2. Assoprar seu barco.

2. Como o jogo se parece?

- Há a cena de login/registrar para criar o usuário.
- Há uma cena de lobby, para escolher ou criar salas, e o botão "equipar".
- Há uma cena de sala, para esperar que os jogadores entrem e iniciem a partida.
- A cena da partida:
    - A cena de dobrar o papel, para cada jogador dobrar seus barcos.
    - A cena de assoprar, onde todos os barcos dobrados são colocados e funcionam.

- Extra: Cena de finalização, para as estatísticas da partida.
- Extra: Cena de equipar, para escolher seu "estilo de barco".

3. Como o jogo será executado?

- O jogo será executado em um servidor web:
    - O servidor mantém o lobby.
    - O usuário mantém sua partida.

- Após o login, o usuário entra no lobby do servidor.
> Referência de imagem: Cena de lobby PVP de Grand Chase

- Na sala, há o "anfitrião" e os outros.
    - Os outros têm que marcar como prontos.
    - Quando todos estiverem prontos, o anfitrião pode iniciar a partida.
> Assim como na cena de Sala PVP em Grand Chase.

**Extras**:
- Por enquanto, é isso.

4. Como o jogo será feito?

- JavaScript e Maizena( em outras palavras, fullstack javascript )



# História

> Uma breve descrição do mundo.

## Personagens

### O usuário (em geral)

- Será um avatar "wii-like" para cada usuário.
    - Você pode escolher homem ou mulher.
    - Cada usuário pode usar um "papel" ou um "barco" (ainda não sei).
    - Não há sistema de evolução ou upgrade de barcos (ainda não, talvez nunca).

### Os barcos

- Existem 3 estilos de barcos.
    - Todos terão o mesmo status, somente diferença visual.

## Configuração

- Para rodar em um navegador, seja mobile ou desktop, as configurações seram as mesmas.
    - No caso desktop, o usuário usará o mouse.
    - No mobile, será o clique na tela.

## Narrativa

> SEJA O MELHOR DOBRADOR-ASSOPRADOR DE BARCOS DE TODOS OS TEMPOS!

- Por séculos, a arte de dobrar papel percorre nossa sociedade. Algumas pessoas são capazes de criar figuras e criaturas incríveis com apenas algumas dobras. Mas há uma origami principal que todos tentaram fazer: O Barco. Com estilos diferentes, há muitos navios magníficos esperando para velejar e competir! Torne-se o melhor barco dobrador-corredor e conquiste os oceanos!



# Jogabilidade

## Loop Principal

> O evento principal do jogo.

- A partida:
    1. A fase de dobra
    2. A fase de assoprar

## Mecânicas

> Regras e ações básicas.

- Regras básicas:
    - Cada usuário interage somente com seu barco.
    - Na corrida, podemos ver uma silhueta do progresso de todos jogadores.

- Ação básica do usuário:
    - Clicar nos botões refentes às dobras, e os referentes ao assopro.
    - Cada um terá a mesma quantidade de passos para concluir o barco, e para correr.


## Dinâmicas

> O comportamento emergente que surge da jogabilidade, quando as mecânicas são colocadas em uso.

- Na fase de dobra:
    - O jogador tem que segurar e arrastar os botões conforme as etapas. Cada erro reinicia a dobra.


- Na fase de correr:
    - O jogador tem que acertar em menor tempo possível os botões para ganhar um pouco mais de velocidade. Cada erro sua velocidade cai um pouco, por pouco tempo.



# Design de Níveis

> Descrição sobre como deve ficar as cenas dentro do jogo

## "A Dobra do Papel"

- Por cima o espaço do "oceno", como um pop-up(tirando opacidade e desfocando o fundo), aparece o papel e os botões para realizar as dobras

## "O Oceano"

- Com uma linha de corrida para cada barco, seu barco é colocado na água e começam a aparecer os botões de velocidade. A corrida termina na linha de chegada.



# Arte

> Link para Bíblia de Desenhos
> Descrições básicas, por enquanto

## Avatar do Usuário

- Um avatar padrão, homem ou mulher, no estilo "wii-avatar"

## Cenas

> Imagens de referência para cada cena, à adicionar na próxima etapa...



# UI/Controles do Jogo

## Comando básico

- Somente clique do mouse/dedo, 



# Áudio

> Descrição básica de sonoplastia e trilha sonora

## Sonoplastia

- Ações que terão sonoplastia:
    - Na partida:
        1. Acerto do botão (Bell ring)
        2. Erro do botão (FlapJack "Engolida Errada")
        3. Encerramento (Apito)
        4. Começo (Apito)

    - Na sala:
        1. Entrada de jogador
        2. Saída de jogador 
        3. Contador para começar partida

## Trilha Sonora

- Cenas que terão trilhas:
    - Na partida:
        1. Musiquinha de pirata (wip*/ Instigante) 
        2. Musiquinha de vitória
        3. Musiquinha de derrota
        
    - Na sala:
        1. Musiquinha de pirata (wip*/ Mistério) 

    - No lobby:
        1. Musiquinha de pirata (wip*/ Calma) 

    - No login/registro:
        1. Musiquinha de pirata (wip*/ Épica) 



# Plano de Desenvolvimento

## Protótipo

> Para próximas etapas...

## Pilares de Design

> Para próximas etapas...