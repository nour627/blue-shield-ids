import pandas as pd
import numpy as np
from scapy.all import rdpcap, IP, TCP, UDP
import time
from collections import defaultdict

class CICFeatureExtractor:
    def __init__(self, selected_features):
        self.selected_features = selected_features

    def extract_features(self, pcap_path):
        """
        Extract CICIDS2017 features from a PCAP file.
        This is a simplified flow-based extractor.
        """
        try:
            packets = rdpcap(pcap_path)
        except Exception as e:
            print(f"Error reading PCAP: {e}")
            return pd.DataFrame()

        flows = defaultdict(list)
        
        # Group packets into flows (Src IP, Dst IP, Src Port, Dst Port, Protocol)
        for pkt in packets:
            if IP in pkt:
                proto = pkt[IP].proto
                if TCP in pkt or UDP in pkt:
                    sport = pkt.sport
                    dport = pkt.dport
                    # Create a bidirectional flow key
                    flow_key = tuple(sorted([(pkt[IP].src, sport), (pkt[IP].dst, dport)])) + (proto,)
                    flows[flow_key].append(pkt)

        all_flow_features = []
        
        for key, flow_packets in flows.items():
            if len(flow_packets) < 2: continue
            
            # Basic Flow Info
            start_time = flow_packets[0].time
            end_time = flow_packets[-1].time
            duration = float(end_time - start_time) * 1e6 # microseconds
            
            fwd_pkts = []
            bwd_pkts = []
            src_ip = key[0][0]
            
            for pkt in flow_packets:
                if pkt[IP].src == src_ip:
                    fwd_pkts.append(pkt)
                else:
                    bwd_pkts.append(pkt)
            
            if not fwd_pkts: continue
            
            fwd_lengths = [len(p) for p in fwd_pkts]
            bwd_lengths = [len(p) for p in bwd_pkts] if bwd_pkts else [0]
            all_lengths = fwd_lengths + bwd_lengths
            
            # Calculate features required by the user's model (the 40 features)
            feat = {}
            feat['Flow Duration'] = duration
            feat['Total Fwd Packets'] = len(fwd_pkts)
            feat['Total Backward Packets'] = len(bwd_pkts)
            feat['Total Length of Fwd Packets'] = sum(fwd_lengths)
            feat['Total Length of Bwd Packets'] = sum(bwd_lengths)
            feat['Fwd Packet Length Max'] = max(fwd_lengths)
            feat['Fwd Packet Length Min'] = min(fwd_lengths)
            feat['Fwd Packet Length Mean'] = np.mean(fwd_lengths)
            feat['Bwd Packet Length Max'] = max(bwd_lengths)
            feat['Bwd Packet Length Min'] = min(bwd_lengths)
            feat['Bwd Packet Length Mean'] = np.mean(bwd_lengths)
            feat['Bwd Packet Length Std'] = np.std(bwd_lengths)
            
            # Flags
            psh_count = sum(1 for p in flow_packets if TCP in p and p[TCP].flags.P)
            ack_count = sum(1 for p in flow_packets if TCP in p and p[TCP].flags.A)
            urg_count = sum(1 for p in flow_packets if TCP in p and p[TCP].flags.U)
            feat['PSH Flag Count'] = psh_count
            feat['ACK Flag Count'] = ack_count
            feat['URG Flag Count'] = urg_count
            feat['Fwd PSH Flags'] = sum(1 for p in fwd_pkts if TCP in p and p[TCP].flags.P)
            
            # Packet Lengths
            feat['Max Packet Length'] = max(all_lengths)
            feat['Min Packet Length'] = min(all_lengths)
            feat['Packet Length Mean'] = np.mean(all_lengths)
            feat['Packet Length Std'] = np.std(all_lengths)
            feat['Packet Length Variance'] = np.var(all_lengths)
            feat['Average Packet Size'] = np.mean(all_lengths)
            
            # Segments
            feat['Avg Fwd Segment Size'] = np.mean(fwd_lengths)
            feat['Avg Bwd Segment Size'] = np.mean(bwd_lengths)
            
            # Header lengths
            feat['Fwd Header Length'] = sum(len(p[IP]) for p in fwd_pkts)
            feat['Fwd Header Length.1'] = feat['Fwd Header Length']
            feat['Bwd Header Length'] = sum(len(p[IP]) for p in bwd_pkts) if bwd_pkts else 0
            
            # Rates
            feat['Bwd Packets/s'] = len(bwd_pkts) / (duration / 1e6) if duration > 0 else 0
            
            # Win bytes (Initial window size)
            feat['Init_Win_bytes_forward'] = fwd_pkts[0][TCP].window if TCP in fwd_pkts[0] else 0
            feat['Init_Win_bytes_backward'] = bwd_pkts[0][TCP].window if (bwd_pkts and TCP in bwd_pkts[0]) else 0
            
            # IATs
            fwd_iats = np.diff([p.time for p in fwd_pkts]) if len(fwd_pkts) > 1 else [0]
            feat['Fwd IAT Mean'] = np.mean(fwd_iats) * 1e6
            feat['Fwd IAT Max'] = np.max(fwd_iats) * 1e6
            feat['Fwd IAT Min'] = np.min(fwd_iats) * 1e6
            
            flow_iats = np.diff([p.time for p in flow_pkts]) if len(flow_pkts) > 1 else [0]
            feat['Flow IAT Max'] = np.max(flow_iats) * 1e6
            
            # Subflows
            feat['Subflow Fwd Packets'] = len(fwd_pkts)
            feat['Subflow Fwd Bytes'] = sum(fwd_lengths)
            feat['Subflow Bwd Packets'] = len(bwd_pkts)
            
            # Others
            feat['act_data_pkt_fwd'] = sum(1 for p in fwd_pkts if len(p) > 0)
            feat['min_seg_size_forward'] = 20 # Placeholder for IP header min size
            feat['Idle Max'] = 0 # Simplified
            
            # Ensure all 40 features are present, fill missing with 0
            final_feat = {f: feat.get(f, 0) for f in self.selected_features}
            
            # Add metadata for display
            final_feat['_src_ip'] = fwd_pkts[0][IP].src
            final_feat['_dst_ip'] = fwd_pkts[0][IP].dst
            final_feat['_timestamp'] = flow_packets[0].time
            
            all_flow_features.append(final_feat)
            
        return pd.DataFrame(all_flow_features)
