
function Colored(color: string): (props: { children?: string }) => JSX.Element {
  return function (props: { children?: string }) {
    return (
      <span style={{ color, whiteSpace: 'pre' }}>{props.children}</span>
    );
  };
}

interface CharacterProps {
  primaryColor: string,
  secondaryColor: string,
}

function CWrapper(props: { children?: React.ReactNode }) {
  return (
    <pre style={{ float: 'left' }}>{props.children}</pre>
  );
}

function CLine(props: { children?: React.ReactNode }) {
  return (
    <div>{props.children}</div>
  );
}

// Source for the following components: https://github.com/dominikwilkowski/cfonts/blob/released/fonts/block.json

function A(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>█████</CP><CS>╗</CS> </CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>███████</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS>  <CP>██</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝  ╚═╝</CS></CLine>
    </CWrapper>
  );
}

function B(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS>╚═════╝ </CS></CLine>
    </CWrapper>
  );
}

function C(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝</CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╗</CS></CLine>
      <CLine><CS> ╚═════╝</CS></CLine>
    </CWrapper>
  );
}

function D(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS>╚═════╝ </CS></CLine>
    </CWrapper>
  );
}

function E(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝</CS></CLine>
      <CLine><CP>█████</CP><CS>╗  </CS></CLine>
      <CLine><CP>██</CP><CS>╔══╝  </CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>
    </CWrapper>
  );
}

function F(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝</CS></CLine>
      <CLine><CP>█████</CP><CS>╗  </CS></CLine>
      <CLine><CP>██</CP><CS>╔══╝  </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CS>╚═╝     </CS></CLine>
    </CWrapper>
  );
}

function G(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝ </CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ███</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═════╝ </CS></CLine>

    </CWrapper>
  );
}

function H(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>  ██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CP>███████</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝  ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function I(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝</CS></CLine>

    </CWrapper>
  );
}
function J(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>     ██</CP><CS>╗</CS></CLine>
      <CLine><CP>     ██</CP><CS>║</CS></CLine>
      <CLine><CP>     ██</CP><CS>║</CS></CLine>
      <CLine><CP>██   ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚════╝ </CS></CLine>

    </CWrapper>
  );
}
function K(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>  ██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP> ██</CP><CS>╔╝</CS></CLine>
      <CLine><CP>█████</CP><CS>╔╝ </CS></CLine>
      <CLine><CP>██</CP><CS>╔═</CS><CP>██</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚═╝  ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function L(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗     </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>

    </CWrapper>
  );
}
function M(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███</CP><CS>╗</CS><CP>   ███</CP><CS>╗</CS></CLine>
      <CLine><CP>████</CP><CS>╗</CS><CP> ████</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>╔</CS><CP>████</CP><CS>╔</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║╚</CS><CP>██</CP><CS>╔╝</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║ ╚═╝</CS><CP> ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝     ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function N(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███</CP><CS>╗</CS><CP>   ██</CP><CS>╗</CS></CLine>
      <CLine><CP>████</CP><CS>╗</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>╔</CS><CP>██</CP><CS>╗</CS><CP> ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║╚</CS><CP>██</CP><CS>╗</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║ ╚</CS><CP>████</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝  ╚═══╝</CS></CLine>

    </CWrapper>
  );
}
function O(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔═══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═════╝ </CS></CLine>

    </CWrapper>
  );
}
function P(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CP>██</CP><CS>╔═══╝ </CS></CLine>
      <CLine><CP>██</CP><CS>║     </CS></CLine>
      <CLine><CS>╚═╝     </CS></CLine>

    </CWrapper>
  );
}
function Q(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔═══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>▄▄ ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚══</CS><CP>▀▀</CP><CS>═╝ </CS></CLine>

    </CWrapper>
  );
}
function R(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚═╝  ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function S(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝</CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>███████</CP><CS>║</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>

    </CWrapper>
  );
}
function T(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>████████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══</CS><CP>██</CP><CS>╔══╝</CS></CLine>
      <CLine><CP>   ██</CP><CS>║   </CS></CLine>
      <CLine><CP>   ██</CP><CS>║   </CS></CLine>
      <CLine><CP>   ██</CP><CS>║   </CS></CLine>
      <CLine><CS>   ╚═╝   </CS></CLine>

    </CWrapper>
  );
}
function U(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>   ██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═════╝ </CS></CLine>

    </CWrapper>
  );
}
function V(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>   ██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>   ██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██</CP><CS>╗</CS><CP> ██</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚</CS><CP>████</CP><CS>╔╝ </CS></CLine>
      <CLine><CS>  ╚═══╝  </CS></CLine>

    </CWrapper>
  );
}
function W(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗    </CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║    </CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP> █</CP><CS>╗</CS><CP> ██</CP><CS>║</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>███</CP><CS>╗</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>███</CP><CS>╔</CS><CP>███</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚══╝╚══╝ </CS></CLine>

    </CWrapper>
  );
}
function X(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>  ██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>██</CP><CS>╗</CS><CP>██</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚</CS><CP>███</CP><CS>╔╝ </CS></CLine>
      <CLine> <CP>██</CP><CS>╔</CS><CP>██</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔╝</CS><CP> ██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚═╝  ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function Y(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>   ██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>██</CP><CS>╗</CS><CP> ██</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚</CS><CP>████</CP><CS>╔╝ </CS></CLine>
      <CLine><CS>  ╚</CS><CP>██</CP><CS>╔╝  </CS></CLine>
      <CLine><CP>   ██</CP><CS>║   </CS></CLine>
      <CLine><CS>   ╚═╝   </CS></CLine>

    </CWrapper>
  );
}
function Z(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══</CS><CP>███</CP><CS>╔╝</CS></CLine>
      <CLine><CP>  ███</CP><CS>╔╝ </CS></CLine>
      <CLine> <CP>███</CP><CS>╔╝  </CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>

    </CWrapper>
  );
}
function N0(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔═</CS><CP>████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>██</CP><CS>╔</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>████</CP><CS>╔╝</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═════╝ </CS></CLine>

    </CWrapper>
  );
}
function N1(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>███</CP><CS>║</CS></CLine>
      <CLine><CS>╚</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine> <CP>██</CP><CS>║</CS></CLine>
      <CLine> <CP>██</CP><CS>║</CS></CLine>
      <CLine><CS> ╚═╝</CS></CLine>

    </CWrapper>
  );
}
function N2(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine> <CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CP>██</CP><CS>╔═══╝ </CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>

    </CWrapper>
  );
}
function N3(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine> <CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS>╚═════╝ </CS></CLine>

    </CWrapper>
  );
}
function N4(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>██</CP><CS>╗</CS><CP>  ██</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>║</CS><CP>  ██</CP><CS>║</CS></CLine>
      <CLine><CP>███████</CP><CS>║</CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>     ██</CP><CS>║</CS></CLine>
      <CLine><CS>     ╚═╝</CS></CLine>
    </CWrapper>
  );
}

function N5(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝</CS></CLine>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>███████</CP><CS>║</CS></CLine>
      <CLine><CS>╚══════╝</CS></CLine>
    </CWrapper>
  );
}

function N6(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>██████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔════╝ </CS></CLine>
      <CLine><CP>███████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔═══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚═════╝ </CS></CLine>
    </CWrapper>
  );
}

function N7(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine><CP>███████</CP><CS>╗</CS></CLine>
      <CLine><CS>╚════</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine><CP>    ██</CP><CS>╔╝</CS></CLine>
      <CLine><CP>   ██</CP><CS>╔╝ </CS></CLine>
      <CLine><CP>   ██</CP><CS>║  </CS></CLine>
      <CLine><CS>   ╚═╝  </CS></CLine>
    </CWrapper>
  );
}

function N8(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>█████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚════╝ </CS></CLine>
    </CWrapper>
  );
}

function N9(props: CharacterProps) {
  const CP = Colored(props.primaryColor);
  const CS = Colored(props.secondaryColor);
  return (
    <CWrapper>
      <CLine> <CP>█████</CP><CS>╗ </CS></CLine>
      <CLine><CP>██</CP><CS>╔══</CS><CP>██</CP><CS>╗</CS></CLine>
      <CLine><CS>╚</CS><CP>██████</CP><CS>║</CS></CLine>
      <CLine><CS> ╚═══</CS><CP>██</CP><CS>║</CS></CLine>
      <CLine> <CP>█████</CP><CS>╔╝</CS></CLine>
      <CLine><CS> ╚════╝ </CS></CLine>
    </CWrapper>
  );
}

function Space() {
  return (
    <pre style={{ float: 'left' }}>
      <div>{'\u00a0'}  </div>
      <div>{'\u00a0'}  </div>
      <div>{'\u00a0'}  </div>
      <div>{'\u00a0'}  </div>
      <div>{'\u00a0'}  </div>
      <div>{'\u00a0'}  </div>
    </pre>
  );
}

function mapCharacter(char: string, props: CharacterProps, index: number): JSX.Element {
  const charUpper = char.toUpperCase();
  switch (charUpper) {
    case 'A': return <A key={`char${index}`} {...props} />
    case 'B': return <B key={`char${index}`} {...props} />
    case 'C': return <C key={`char${index}`} {...props} />
    case 'D': return <D key={`char${index}`} {...props} />
    case 'E': return <E key={`char${index}`} {...props} />
    case 'F': return <F key={`char${index}`} {...props} />
    case 'G': return <G key={`char${index}`} {...props} />
    case 'H': return <H key={`char${index}`} {...props} />
    case 'I': return <I key={`char${index}`} {...props} />
    case 'J': return <J key={`char${index}`} {...props} />
    case 'K': return <K key={`char${index}`} {...props} />
    case 'L': return <L key={`char${index}`} {...props} />
    case 'M': return <M key={`char${index}`} {...props} />
    case 'N': return <N key={`char${index}`} {...props} />
    case 'O': return <O key={`char${index}`} {...props} />
    case 'P': return <P key={`char${index}`} {...props} />
    case 'Q': return <Q key={`char${index}`} {...props} />
    case 'R': return <R key={`char${index}`} {...props} />
    case 'S': return <S key={`char${index}`} {...props} />
    case 'T': return <T key={`char${index}`} {...props} />
    case 'U': return <U key={`char${index}`} {...props} />
    case 'V': return <V key={`char${index}`} {...props} />
    case 'W': return <W key={`char${index}`} {...props} />
    case 'X': return <X key={`char${index}`} {...props} />
    case 'Y': return <Y key={`char${index}`} {...props} />
    case 'Z': return <Z key={`char${index}`} {...props} />
    case '0': return <N0 key={`char${index}`} {...props} />
    case '1': return <N1 key={`char${index}`} {...props} />
    case '2': return <N2 key={`char${index}`} {...props} />
    case '3': return <N3 key={`char${index}`} {...props} />
    case '4': return <N4 key={`char${index}`} {...props} />
    case '5': return <N5 key={`char${index}`} {...props} />
    case '6': return <N6 key={`char${index}`} {...props} />
    case '7': return <N7 key={`char${index}`} {...props} />
    case '8': return <N8 key={`char${index}`} {...props} />
    case '9': return <N9 key={`char${index}`} {...props} />

    default: return <Space key={`char${index}`} />
  }
}

/** Props for BlockTitle component. */
export interface BlockTitleProps {
  /** Primary css color for the main thick block symbols. Defaults to 'white'. */
  primaryColor?: string,
  /** Secondary css color for the depth-giving shadows symbols. Defaults to 'grey'. */
  secondaryColor?: string,
  /** Text to render. Only A-Z, 0-9 and space characters are supported, all others will default to empty space. */
  children: string,
}

/**
 * Component that renders a text as a big nice-looking block-y text with depth, ideal for the game title.
 *
 * @remarks
 * The text content of this component, that is the props.children, will be transformed to html elements that use various special unicode characters.
 * Only A-Z, 0-9 and space characters are supported, all others will default to empty space.
 * The component is not case sensitive for the input but the rendered result always looks like upper case.
 * There are two colors that can be changed via the props for additional customization.
 * Design was copied from the 'block' font from an awesome project `cfonts`, a package for sexy fonts in the console: https://github.com/dominikwilkowski/cfonts
 *
 * @param props Props of the component that include color stylization and string children content. See `BlockTitleProps`.
 */
export function BlockTitle(props: BlockTitleProps): JSX.Element {
  const charProps: CharacterProps = {
    primaryColor: props.primaryColor || 'white',
    secondaryColor: props.secondaryColor || 'grey'
  };

  const characters: React.ReactNodeArray = [];
  for (let i = 0; i < props.children.length; i++) {
    const character = props.children[i];
    characters.push(mapCharacter(character, charProps, i));
  }

  return (
    <div>
      {characters}
      <div style={{ clear: 'left' }} />
    </div>
  );
}