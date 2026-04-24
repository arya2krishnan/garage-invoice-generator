import { Page, Text, View, Image } from "@react-pdf/renderer";
import type { DecodedSpec, Listing } from "@/lib/types";
import { CheckIcon, CrossIcon } from "./Icons";
import { styles } from "./styles";
import { formatInvoiceNumber } from "./utils/formatters";

interface Props {
  listing: Listing;
  heroImage?: Buffer | string;
  specs: DecodedSpec[];
}

export function DetailsPage({ listing, heroImage, specs }: Props) {
  const invoiceNumber = formatInvoiceNumber(listing.secondaryId);
  const categoryName = listing.category?.name ?? "Vehicle";

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsEyebrow}>Vehicle details</Text>
        <Text style={styles.detailsTitle}>{listing.listingTitle}</Text>
        <Text style={styles.detailsCategory}>{categoryName}</Text>
      </View>

      {heroImage ? (
        <Image style={styles.heroImage} src={heroImage} />
      ) : null}

      {specs.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specs.map((spec, i) => {
              const isCheck = spec.value === "✓";
              const isCross = spec.value === "✗";
              return (
                <View
                  key={`${spec.label}-${i}`}
                  style={[
                    styles.specItem,
                    i % 2 === 1 ? styles.specItemRight : {},
                  ]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  {isCheck ? (
                    <View style={styles.specIconWrap}>
                      <CheckIcon size={12} />
                    </View>
                  ) : isCross ? (
                    <View style={styles.specIconWrap}>
                      <CrossIcon size={12} />
                    </View>
                  ) : (
                    <Text style={styles.specValue}>{spec.value}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.pageFooter} fixed>
        <Text>Invoice {invoiceNumber}</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}
