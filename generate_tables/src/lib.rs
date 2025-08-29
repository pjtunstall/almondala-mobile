use proc_macro::TokenStream;
use std::f64::consts::TAU;

use quote::quote;

#[proc_macro]
pub fn generate_color_tables(_input: TokenStream) -> TokenStream {
    const FULL_MAX_ITERATIONS: usize = 1024;

    fn color(escape_iteration: usize) -> [u8; 4] {
        let hue = escape_iteration as f64 / FULL_MAX_ITERATIONS as f64;
        let r = ((hue * 23.0 * TAU).sin() * 128.0 + 128.0).clamp(0.0, 255.0) as u8;
        let g = ((hue * 17.0 * TAU + 2.0).sin() * 128.0 + 128.0).clamp(0.0, 255.0) as u8;
        let b = ((hue * 17.0 * TAU + 3.0).sin() * 128.0 + 128.0).clamp(0.0, 255.0) as u8;
        [r, g, b, 255]
    }

    fn shade(escape_iteration: usize) -> [u8; 4] {
        let fraction = escape_iteration as f64 / FULL_MAX_ITERATIONS as f64;
        let shade = ((fraction * 23.0 * TAU).sin() * 128.0 + 128.0).clamp(0.0, 255.0) as u8;
        [shade, shade, shade, 255]
    }

    let colors_tokens = (0..FULL_MAX_ITERATIONS).map(|i| {
        let [r, g, b, a] = color(i);
        quote! { [#r, #g, #b, #a] }
    });

    let shades_tokens = (0..FULL_MAX_ITERATIONS).map(|i| {
        let [r, g, b, a] = shade(i);
        quote! { [#r, #g, #b, #a] }
    });

    let expanded = quote! {
        pub const COLORS: [[u8; 4]; #FULL_MAX_ITERATIONS] = [#(#colors_tokens),*];
        pub const SHADES: [[u8; 4]; #FULL_MAX_ITERATIONS] = [#(#shades_tokens),*];
    };

    TokenStream::from(expanded)
}
