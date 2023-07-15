/// A 4-channel color type with a precision of [`T`].
#[derive(Copy, Clone, PartialEq, Debug, Default)]
pub struct Rgba<T> {
    pub alpha: T,
    pub red: T,
    pub green: T,
    pub blue: T,
}

/// A 4-channel color type with 8-bit wide channels.
#[derive(Copy, Clone, PartialEq, PartialOrd, Debug, Default)]
pub struct Color {
    red: u8,
    green: u8,
    blue: u8,
    alpha: u8,
}

impl From<Rgba<u8>> for Color {
    fn from(col: Rgba<u8>) -> Self {
        Self {
            red: col.red,
            green: col.green,
            blue: col.blue,
            alpha: col.alpha,
        }
    }
}

impl From<Color> for Rgba<u8> {
    fn from(col: Color) -> Self {
        Rgba {
            red: col.red,
            green: col.green,
            blue: col.blue,
            alpha: col.alpha,
        }
    }
}

impl From<Rgba<u8>> for Rgba<f32> {
    fn from(col: Rgba<u8>) -> Self {
        Self {
            red: (col.red as f32) / 255.0,
            green: (col.green as f32) / 255.0,
            blue: (col.blue as f32) / 255.0,
            alpha: (col.alpha as f32) / 255.0,
        }
    }
}

impl From<Color> for Rgba<f32> {
    fn from(col: Color) -> Self {
        let u8col: Rgba<u8> = col.into();
        u8col.into()
    }
}

impl From<Rgba<f32>> for Color {
    fn from(col: Rgba<f32>) -> Self {
        Self {
            red: (col.red * 255.).round() as u8,
            green: (col.green * 255.).round() as u8,
            blue: (col.blue * 255.).round() as u8,
            alpha: (col.alpha * 255.).round() as u8,
        }
    }
}

impl Color {
    pub const fn from_argb_hash(encoded: u32) -> Color {
        Self {
            red: (encoded >> 16) as u8,
            green: (encoded >> 8) as u8,
            blue: encoded as u8,
            alpha: (encoded >> 24) as u8,
        }
    }

    pub fn into_argb_hash(&self) -> u32 {
        ((self.red as u32) << 16)
            | ((self.green as u32) << 8)
            | (self.blue as u32)
            | ((self.alpha as u32) << 24)
    }

    pub const fn from_argb_u8(alpha: u8, red: u8, green: u8, blue: u8) -> Self {
        Self {
            red,
            green,
            blue,
            alpha,
        }
    }

    pub const fn from_rgb_u8(red: u8, green: u8, blue: u8) -> Self {
        Self::from_argb_u8(255, red, green, blue)
    }

    pub fn from_argb_f32(alpha: f32, red: f32, green: f32, blue: f32) -> Self {
        Rgba {
            alpha,
            red,
            green,
            blue,
        }
        .into()
    }

    pub fn from_rgb_f32(red: f32, green: f32, blue: f32) -> Self {
        Self::from_argb_f32(1.0, red, green, blue)
    }

    pub fn to_argb_u8(&self) -> Rgba<u8> {
        Rgba::from(*self)
    }

    pub fn to_argb_f32(&self) -> Rgba<f32> {
        Rgba::from(*self)
    }

    pub fn red(self) -> u8 {
        self.red
    }

    pub fn green(self) -> u8 {
        self.green
    }

    pub fn blue(self) -> u8 {
        self.blue
    }

    /// Supplies the 8-bit value of the alpha channel.
    pub fn alpha(self) -> u8 {
        self.alpha
    }

    /// Increases the brightness of `this` color with a given magnitude of `factor`.
    pub fn brighten(&self, factor: f32) -> Self {
        let rgba: Rgba<f32> = (*self).into();
        let mut hsva: Hsva = rgba.into();
        hsva.v *= 1. + factor;
        let rgba: Rgba<f32> = hsva.into();
        rgba.into()
    }

    /// Decreases the brightness of `this` color with a given magnitude of `factor`.
    pub fn darker(&self, factor: f32) -> Self {
        let rgba: Rgba<f32> = (*self).into();
        let mut hsva: Hsva = rgba.into();
        hsva.v /= 1. + factor;
        let rgba: Rgba<f32> = hsva.into();
        rgba.into()
    }

    /// Applies a modification on the alpha channel.
    pub fn apply_alpha(&self, factor: f32) -> Self {
        let mut color = *self;
        color.alpha = ((self.alpha as f32) * (1.0 - factor))
            .round()
            .clamp(u8::MIN as f32, u8::MAX as f32) as u8;
        color
    }

    /// Mixes this color with a color passed in as `other`. A factor
    pub fn mix(&self, other: &Self, factor: Option<f32>) -> Self {
        let original_factor = factor
            .and_then(|weight| Some(weight.clamp(0.0, 1.0)))
            .unwrap_or_default();
        let self_opacity = Rgba::<f32>::from(*self).alpha;
        let other_opacity = Rgba::<f32>::from(*other).alpha;
        let normal_weight = 2.0 * original_factor - 1.0;
        let alpha_distance = self_opacity - other_opacity;
        let weight_by_distance = normal_weight * alpha_distance;
        let combined_weight = if weight_by_distance == -1.0 {
            normal_weight
        } else {
            (normal_weight + alpha_distance) / (1.0 + weight_by_distance)
        };

        let channels_factor = (combined_weight + 1.0) / 2.0;
        let red = lerp(self.red, other.red, channels_factor);
        let green = lerp(self.green, other.green, channels_factor);
        let blue = lerp(self.blue, other.blue, channels_factor);
        let alpha = lerp(self.alpha, other.alpha, original_factor);

        Self {
            red,
            green,
            blue,
            alpha,
        }
    }

    /// Returns the current color with the alpha channel being updated to the passed-in value.
    pub fn with_alpha(&self, alpha: f32) -> Self {
        let mut rgba: Rgba<f32> = (*self).into();
        rgba.alpha = alpha.clamp(0.0, 1.0);
        rgba.into()
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct Hsva {
    h: f32,
    s: f32,
    v: f32,
    alpha: f32,
}

impl From<Rgba<f32>> for Hsva {
    fn from(col: Rgba<f32>) -> Self {
        let red = col.red;
        let green = col.green;
        let blue = col.blue;

        let min = red.min(green).min(blue);
        let max = red.max(green).max(blue);
        let chroma = max - min;

        #[allow(clippy::float_cmp)]
        let hue = 60.
            * if chroma == 0. {
                0.0
            } else if max == red {
                ((green - blue) / chroma) % 6.0
            } else if max == green {
                2. + (blue - red) / chroma
            } else {
                4. + (red - green) / chroma
            };

        let saturation = if max == 0. { 0. } else { chroma / max };

        Self {
            h: hue,
            s: saturation,
            v: max,
            alpha: col.alpha,
        }
    }
}

impl From<Hsva> for Rgba<f32> {
    fn from(col: Hsva) -> Self {
        let chroma = col.s * col.v;
        let x = chroma * (1. - ((col.h / 60.) % 2. - 1.).abs());
        let (red, green, blue) = match (col.h / 60.0) as usize {
            0 => (chroma, x, 0.),
            1 => (x, chroma, 0.),
            2 => (0., chroma, x),
            3 => (0., x, chroma),
            4 => (x, 0., chroma),
            5 => (chroma, 0., x),
            _ => (0., 0., 0.),
        };

        let m = col.v - chroma;
        Self {
            red: red + m,
            green: green + m,
            blue: blue + m,
            alpha: col.alpha,
        }
    }
}

/// Linearly interpolates between the `from` and `to` values with a factor of `factor`.
fn lerp(from: u8, to: u8, factor: f32) -> u8 {
    (from as f32 * factor + to as f32 * (1.0 - factor))
        .clamp(u8::MIN as f32, u8::MAX as f32)
        .round() as u8
}
