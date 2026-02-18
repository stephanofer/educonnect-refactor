import { useParams, Link, Navigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Info,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  resources,
  type ResourceContent,
} from "@/ui/features/resources/data/resources";

function ContentBlock({ block }: { block: ResourceContent }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-10 mb-4">
          {block.text}
        </h2>
      );
    case "subheading":
      return (
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
          {block.text}
        </h3>
      );
    case "list":
      return (
        <ul className="space-y-2.5 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base leading-relaxed text-muted-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-primary pl-6 py-2">
          <p className="text-lg italic text-foreground leading-relaxed">
            "{block.text}"
          </p>
          {block.author && (
            <cite className="block mt-3 text-sm text-muted-foreground not-italic">
              — {block.author}
            </cite>
          )}
        </blockquote>
      );
    case "callout": {
      const config = {
        tip: {
          icon: Lightbulb,
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          iconColor: "text-emerald-600",
          titleColor: "text-emerald-800",
        },
        warning: {
          icon: AlertTriangle,
          bg: "bg-amber-50",
          border: "border-amber-200",
          iconColor: "text-amber-600",
          titleColor: "text-amber-800",
        },
        info: {
          icon: Info,
          bg: "bg-blue-50",
          border: "border-blue-200",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
        },
      };
      const c = config[block.variant];
      const Icon = c.icon;
      return (
        <div
          className={`my-6 rounded-2xl ${c.bg} border ${c.border} p-5 sm:p-6`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Icon className={`w-5 h-5 ${c.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${c.titleColor} mb-1.5`}>
                {block.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {block.text}
              </p>
            </div>
          </div>
        </div>
      );
    }
    case "image":
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-2xl"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const resource = resources.find((r) => r.slug === slug);

  if (!resource) {
    return <Navigate to="/recursos" replace />;
  }

  const currentIndex = resources.findIndex((r) => r.slug === slug);
  const nextResource = resources[(currentIndex + 1) % resources.length];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: resource.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/recursos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Recursos
          </Link>
        </motion.div>
      </div>

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center"
      >
        <span className="inline-block text-sm font-semibold text-primary mb-4">
          {resource.category}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-6">
          {resource.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>{resource.date}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {resource.readTime}
          </span>
        </div>
      </motion.header>

      {/* Cover Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
      >
        <div
          className={`aspect-[2/1] sm:aspect-[2.5/1] rounded-3xl overflow-hidden ${resource.coverBgColor}`}
        >
          <img
            src={resource.coverImage}
            alt={resource.coverAlt}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="space-y-5">
          {resource.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>

        {/* Share & Tags */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                Categoria:
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {resource.category}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        </div>
      </motion.article>

      {/* Next article */}
      {nextResource && nextResource.slug !== resource.slug && (
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Siguiente articulo
            </p>
            <Link
              to={`/recursos/${nextResource.slug}`}
              className="group flex items-start gap-6"
            >
              <div
                className={`hidden sm:block w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 ${nextResource.coverBgColor}`}
              >
                <img
                  src={nextResource.coverImage}
                  alt={nextResource.coverAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-primary">
                  {nextResource.category}
                </span>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mt-1">
                  {nextResource.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {nextResource.excerpt}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">EduConnect</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Aprende con un tutor personalizado
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Los recursos gratuitos son un gran inicio. Para llevar tu
            aprendizaje al siguiente nivel, conecta con un tutor experto.
          </p>
          <Link to="/registro">
            <Button className="bg-primary hover:bg-primary/90 h-12 px-8 gap-2">
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
