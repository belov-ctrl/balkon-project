import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksGlazingCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_glazing_cards';
  info: {
    displayName: 'GlazingCard';
  };
  attributes: {
    badge: Schema.Attribute.String;
    desc: Schema.Attribute.Text;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    price: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksStructureTab extends Struct.ComponentSchema {
  collectionName: 'components_blocks_structure_tabs';
  info: {
    displayName: 'StructureTab';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    features: Schema.Attribute.Text;
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    tabName: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.glazing-card': BlocksGlazingCard;
      'blocks.structure-tab': BlocksStructureTab;
    }
  }
}
