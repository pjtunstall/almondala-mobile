use super::{escape, Params};

pub fn is_perimeter_all_black(params: &Params) -> bool {
    let top = check_edge(params, 0, 0, params.tile_width - 1, 0);
    let bottom = check_edge(
        params,
        0,
        params.tile_height - 1,
        params.tile_width - 1,
        params.tile_height - 1,
    );
    let left = check_edge(params, 0, 0, 0, params.tile_height - 1);
    let right = check_edge(
        params,
        params.tile_width - 1,
        0,
        params.tile_width - 1,
        params.tile_height - 1,
    );

    top && bottom && left && right
}

fn check_edge(params: &Params, start_x: usize, start_y: usize, end_x: usize, end_y: usize) -> bool {
    for x in start_x..=end_x {
        for y in start_y..=end_y {
            if escape::get_escape_iteration(x, y, params) < params.max_iterations {
                return false;
            }
        }
    }

    true
}
