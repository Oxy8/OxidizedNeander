{
  description = "Rust-wasm environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    fenix = {
      url = "github:nix-community/fenix/monthly";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, fenix, ... }:

      let
        system = "x86_64-linux";
        overlays = [ fenix.overlays.default ];
        pkgs = import nixpkgs {
          inherit system overlays;
          config = { allowUnfree = true; };
        };

        rust-toolchain = with fenix.packages.${system}; combine [
          latest.cargo
          latest.rustc
          latest.rust-src
          targets."wasm32-unknown-unknown".latest.rust-std
          targets."wasm32-wasi".latest.rust-std
        ];
        # Using nightly(monthly) for new proc-macros support
        # Selecting toolchain components manually as not all of them
        # support wasm32 as a target

        extensions = with pkgs.vscode-extensions; [
            serayuzgur.crates
            vadimcn.vscode-lldb
            rust-lang.rust-analyzer-nightly
            tamasfe.even-better-toml
            pkief.material-icon-theme
            dbaeumer.vscode-eslint
          ];
        
        vscode-with-extensions =
          pkgs.vscode-with-extensions.override { vscodeExtensions = extensions; };
        
      in
      with pkgs;
      {
        devShell.x86_64-linux = mkShell {
          buildInputs = [
            bashInteractive # needed for vscode integrated terminal to work properly
            rust-toolchain
            rust-analyzer-nightly 
            wasm-pack
            wasm-bindgen-cli
            vscode-with-extensions
            pkg-config # needed for cargo
            openssl # needed for cargo
            wabt # tools for working with WebAssembly
            nodejs # needed for solid-js
                   # Temporary use
                   # need to move these components inside flake.nix
          ];

        shellHook =
        ''
			export PATH=$PATH:$HOME/.cargo/bin:./node_modules/.bin
        '';
        };
      };
}
