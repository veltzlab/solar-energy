export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    slug: "como-energia-solar-reduz-sua-conta-de-luz",
    title: "Como a Energia Solar pode reduzir sua conta de luz em até 95%",
    excerpt: "Entenda o funcionamento do sistema de compensação de créditos de energia e descubra como se proteger dos constantes aumentos tarifários.",
    content: `
      <p>A energia solar deixou de ser apenas uma tecnologia do futuro para se tornar uma realidade acessível e altamente rentável no presente. Mas como exatamente instalar placas no seu telhado se traduz em economia no final do mês?</p>

      <h3>O Sistema de Compensação de Energia</h3>
      <p>No Brasil, o sistema mais comum é o <strong>On-Grid</strong> (conectado à rede). Funciona de maneira muito simples e inteligente: durante o dia, seus painéis solares captam a luz do sol e geram energia elétrica. Essa energia é consumida instantaneamente pelos aparelhos que estão ligados na sua casa (geladeira, ar-condicionado, TVs).</p>

      <p>Porém, geralmente o sistema produz mais energia do que você está consumindo no momento. É aí que a mágica acontece: o excedente é injetado na rede da distribuidora de energia (como Enel, CPFL, Cemig, etc.).</p>

      <p>Essa energia injetada na rede é convertida em <strong>créditos energéticos</strong>. À noite ou em dias muito chuvosos, quando seu sistema não está gerando energia suficiente, você passa a consumir a energia da rua normalmente. No final do mês, a distribuidora faz o balanço: o que você injetou menos o que você consumiu.</p>

      <h3>A Economia na Prática</h3>
      <p>Se o seu sistema foi bem dimensionado, os créditos gerados cobrem quase todo o seu consumo. Você passará a pagar apenas a <strong>taxa mínima de disponibilidade</strong> (o custo para estar conectado à rede) e a taxa de iluminação pública. Isso costuma representar uma queda de até 95% no valor total da sua fatura.</p>

      <p>E o melhor: esses créditos têm validade de 60 meses e podem até ser transferidos para outro imóvel que esteja no seu nome e na mesma área de concessão (por exemplo, os créditos gerados na sua casa podem abater a conta do seu escritório).</p>

      <h3>Proteção contra a Inflação Energética</h3>
      <p>Além da redução imediata, gerar sua própria energia é um escudo financeiro. O Brasil possui as famosas bandeiras tarifárias (amarela, vermelha 1, vermelha 2) que encarecem a conta em períodos de seca. Com energia solar, você deixa de ser refém das flutuações das tarifas de energia, garantindo previsibilidade para o seu orçamento pelas próximas décadas.</p>

      <p>Pronto para começar a economizar? Faça uma simulação conosco e descubra o potencial do seu telhado!</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: "Equipe Solar Energy",
    date: "10 de Abril, 2026",
    category: "Economia",
    readTime: "4 min de leitura"
  },
  {
    id: "2",
    slug: "energia-solar-valoriza-imovel",
    title: "Mito ou Verdade: A energia solar realmente valoriza o imóvel?",
    excerpt: "Especialistas do mercado imobiliário apontam que propriedades com sistemas fotovoltaicos são vendidas mais rápido e com um prêmio significativo de preço.",
    content: `
      <p>Quando pensamos em energia solar, o primeiro benefício que vem à mente é, sem dúvidas, a redução drástica na conta de luz. No entanto, existe um segundo benefício financeiro enorme que muitas vezes é ignorado no momento de decisão: a valorização imobiliária.</p>

      <h3>O que diz o mercado?</h3>
      <p>Estudos realizados em diversos países, incluindo o Brasil, mostram que imóveis equipados com sistemas de geração de energia solar sofrem uma <strong>valorização imediata entre 3% e 6%</strong> no seu valor de mercado. Em algumas regiões com alto custo de energia elétrica, esse percentual pode ser ainda maior.</p>

      <p>Para ilustrar: se você possui uma casa avaliada em R$ 800.000 e instala um sistema fotovoltaico de R$ 30.000, o valor de revenda do seu imóvel pode facilmente saltar para cerca de R$ 840.000. Ou seja, a própria valorização já paga o investimento feito no sistema.</p>

      <h3>Por que propriedades solares são tão desejadas?</h3>
      <p>Compradores modernos estão cada vez mais exigentes e buscam duas coisas principais:</p>
      <ul>
        <li><strong>Redução de custos fixos:</strong> Comprar uma casa sabendo que não precisará se preocupar com contas de luz exorbitantes é um argumento de venda fortíssimo. O novo morador herda um sistema que já está gerando economia desde o dia 1.</li>
        <li><strong>Sustentabilidade:</strong> Existe uma conscientização crescente sobre a necessidade de consumir energia limpa. Imóveis "verdes" têm um apelo de marketing superior.</li>
      </ul>

      <h3>Liquidez no mercado</h3>
      <p>Além do valor absoluto maior, corretores relatam que casas com painéis solares passam menos tempo anunciadas. A liquidez do imóvel aumenta, facilitando a venda em um mercado competitivo.</p>

      <p>Portanto, instalar energia solar não é um "gasto" que se perde na estrutura da casa. É um investimento com duplo retorno: a economia mensal e a valorização patrimonial.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: "Equipe Solar Energy",
    date: "05 de Abril, 2026",
    category: "Investimento",
    readTime: "3 min de leitura"
  },
  {
    id: "3",
    slug: "manutencao-paineis-solares-guia",
    title: "Guia completo de manutenção para seus painéis solares",
    excerpt: "Descubra o que é necessário para manter seu sistema fotovoltaico operando em capacidade máxima com um esforço mínimo.",
    content: `
      <p>Muitas pessoas hesitam em instalar energia solar por medo de dores de cabeça com manutenção. A boa notícia? Os sistemas fotovoltaicos são notórios por exigirem pouquíssima manutenção. Como não possuem partes móveis (peças que giram ou se desgastam com atrito), o desgaste mecânico é quase inexistente.</p>

      <h3>O que precisa ser feito?</h3>
      <p>Na grande maioria dos casos, a única "manutenção" necessária para o seu sistema solar é a <strong>limpeza periódica dos painéis</strong>.</p>
      
      <p>A poeira, folhas, fezes de pássaros e fuligem podem se acumular na superfície dos painéis ao longo do tempo. Como a luz precisa penetrar no vidro para chegar às células de silício, qualquer sujeira atua como uma barreira que reduz a eficiência da geração de energia (uma perda que pode variar de 5% a 20%, dependendo da sujeira).</p>

      <h3>Com que frequência devo limpar?</h3>
      <p>Isso depende fortemente da sua região:</p>
      <ul>
        <li><strong>Regiões com chuvas regulares:</strong> A própria chuva faz grande parte do trabalho de limpeza. Muitas vezes, uma limpeza profissional por ano é suficiente.</li>
        <li><strong>Regiões secas ou com muita poeira (ex: próximo a estradas de terra ou áreas industriais):</strong> Recomenda-se a limpeza a cada 6 meses.</li>
      </ul>

      <h3>Como a limpeza deve ser feita?</h3>
      <p>É importante frisar que a limpeza deve ser feita <strong>sem produtos abrasivos</strong>. O uso de detergentes fortes ou esponjas ásperas pode riscar o vidro protetor e causar danos irreversíveis. Na maioria das vezes, água pura (de preferência desmineralizada) e uma escova de cerdas muito macias é tudo o que se usa.</p>
      <p>Recomendamos fortemente contratar empresas especializadas para realizar essa limpeza, pois o acesso ao telhado envolve riscos de queda e o manuseio com água perto de equipamentos elétricos exige cuidados profissionais.</p>

      <h3>E o Inversor Solar?</h3>
      <p>O inversor (o "cérebro" do sistema) geralmente fica instalado em um local protegido na parede. A manutenção dele se resume a verificar, de vez em quando, se as luzes de LED estão normais e se as saídas de ventilação do aparelho não estão obstruídas por poeira. A vida útil do inversor costuma ser em torno de 10 a 15 anos, momento em que poderá precisar ser substituído.</p>

      <p>De forma geral, instalar energia solar é investir em tranquilidade. Você instala e deixa o sol fazer o trabalho duro.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: "Equipe Solar Energy",
    date: "28 de Março, 2026",
    category: "Tecnologia",
    readTime: "5 min de leitura"
  },
  {
    id: "4",
    slug: "passo-a-passo-instalacao-energia-solar",
    title: "O passo a passo da instalação: Do orçamento ao sistema ligado",
    excerpt: "Saiba exatamente como funciona o processo de instalação de um sistema de energia solar, desde o primeiro contato até o início da geração.",
    content: `
      <p>Tomar a decisão de investir em energia solar é o primeiro passo. Mas o que acontece depois? Muitas pessoas imaginam que o processo de instalação será demorado e destrutivo (como uma reforma em casa). A realidade, porém, é bem diferente.</p>

      <h3>1. Dimensionamento e Projeto</h3>
      <p>Tudo começa com a análise da sua conta de luz e do seu telhado. Nossos engenheiros calculam qual a potência necessária para zerar o seu consumo e projetam a disposição dos painéis no seu telhado, considerando inclinação e sombreamento (muitas vezes utilizando softwares e drones).</p>

      <h3>2. Aprovação e Tramitação na Concessionária</h3>
      <p>Antes de instalar, precisamos enviar o projeto para a sua distribuidora de energia (Enel, CPFL, etc.) para solicitar o "Parecer de Acesso". Essa etapa é totalmente burocrática e cuidamos de tudo. A concessionária aprova o projeto e garante que a rede da sua rua suportará o sistema.</p>

      <h3>3. A Instalação Física</h3>
      <p>Esta é a etapa que mais surpreende os clientes. A instalação física das placas no telhado de uma residência média dura, na grande maioria das vezes, <strong>apenas 1 a 2 dias úteis</strong>. Não há "quebra-quebra" de paredes. A equipe fixa os suportes nas telhas, acopla as placas, passa os cabos (geralmente por tubulações já existentes) e instala o inversor perto do quadro de luz.</p>

      <h3>4. Vistoria e Troca de Medidor</h3>
      <p>Com tudo instalado, a concessionária de energia é notificada para realizar a vistoria técnica. Eles enviam um técnico à sua casa para verificar se tudo foi feito conforme as normas de segurança. Estando tudo certo, eles trocam o seu relógio de luz antigo por um <strong>medidor bidirecional</strong> (que consegue medir tanto a energia que você consome quanto a energia que você injeta na rua).</p>

      <h3>5. Sistema Ligado!</h3>
      <p>Assim que o medidor novo é instalado, você recebe o aval para "ligar o disjuntor". A partir desse exato segundo, você começa a gerar sua própria energia e a acumular créditos.</p>

      <p>Todo o processo, do fechamento do contrato até a máquina girando, costuma levar entre 30 a 60 dias, sendo que o seu envolvimento é mínimo. Nós cuidamos de cada detalhe técnico e burocrático para você focar apenas em acompanhar a economia pelo aplicativo do celular.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: "Equipe Solar Energy",
    date: "15 de Março, 2026",
    category: "Guia",
    readTime: "4 min de leitura"
  }
];
