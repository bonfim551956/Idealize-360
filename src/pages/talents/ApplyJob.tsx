import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getJob } from "@/lib/api/jobs";
import { createApplication } from "@/lib/api/candidates";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id as string),
    enabled: !!id,
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    experience: "",
    motivation: "",
    resume: null as File | null,
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

    // Junta as informações extras em observações (o upload de currículo
    // será ligado ao Storage numa próxima etapa).
    const notes = [
      formData.linkedin && `LinkedIn: ${formData.linkedin}`,
      formData.portfolio && `Portfólio: ${formData.portfolio}`,
      formData.experience && `Experiência: ${formData.experience}`,
      formData.motivation && `Motivação: ${formData.motivation}`,
      formData.resume && `Currículo enviado: ${formData.resume.name}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await createApplication({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        jobId: job.id,
        unitId: job.unit?.id ?? null,
        notes,
      });

      toast({
        title: "Candidatura enviada!",
        description:
          "Sua candidatura foi recebida com sucesso. Entraremos em contato em breve.",
      });
      navigate("/careers");
    } catch (err) {
      toast({
        title: "Erro ao enviar candidatura",
        description:
          err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
          <Button className="mt-4" asChild>
            <Link to="/careers">Voltar para vagas</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Link
          to={`/careers/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a vaga
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Candidatar-se para {job.title}</CardTitle>
              <CardDescription>{job.unit?.name ?? ""}</CardDescription>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Etapa {step} de {totalSteps}
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedin: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Resume & Experience */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Currículo e Experiência</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Currículo (PDF) *</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          {formData.resume ? (
                            <div className="flex items-center justify-center gap-3">
                              <FileText className="h-8 w-8 text-success" />
                              <div>
                                <p className="font-medium">{formData.resume.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setFormData({ ...formData, resume: null })
                                }
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-2 font-medium">
                                Clique para enviar seu currículo
                              </p>
                              <p className="text-sm text-muted-foreground">
                                PDF até 5MB
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">
                          Experiências relevantes para a vaga *
                        </Label>
                        <Textarea
                          id="experience"
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData({ ...formData, experience: e.target.value })
                          }
                          placeholder="Descreva suas experiências anteriores que se relacionam com esta vaga..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Motivation */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Motivação</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="motivation">
                          Por que você quer trabalhar na Idealize? *
                        </Label>
                        <Textarea
                          id="motivation"
                          value={formData.motivation}
                          onChange={(e) =>
                            setFormData({ ...formData, motivation: e.target.value })
                          }
                          placeholder="Conte-nos o que te motiva a fazer parte do nosso time..."
                          rows={5}
                          required
                        />
                      </div>
                      <div className="rounded-lg bg-secondary p-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          Próximos passos
                        </h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Após enviar sua candidatura, você receberá um e-mail de
                          confirmação. Nosso time de RH analisará seu perfil e
                          entrará em contato caso você seja selecionado para as
                          próximas etapas do processo seletivo.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Voltar
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && (!formData.name || !formData.email || !formData.phone)) ||
                        (step === 2 && (!formData.resume || !formData.experience))
                      }
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !formData.motivation}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Enviando...
                        </span>
                      ) : (
                        "Enviar candidatura"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
